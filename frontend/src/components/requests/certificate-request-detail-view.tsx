import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, FileUp, Loader2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { CancelCertificateRequestButton } from '@/components/requests/cancel-certificate-request-button';
import { CertificateRequestSummary } from '@/components/requests/certificate-request-summary';
import { InvoiceAttachmentCard } from '@/components/requests/invoice-attachment-card';
import { PurchaseReplaceDocumentPrompt } from '@/components/requests/purchase-replace-document-prompt';
import { RequestHistoryTimeline } from '@/components/requests/request-history-timeline';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { Button } from '@/components/ui/button';
import { DocumentUploadField } from '@/components/ui/document-upload-field';
import { useWebSession } from '@/hooks/auth/use-web-session';
import { HttpClientError } from '@/lib/http-client';
import { getComparisonInvoiceAttachment } from '@/lib/certificate-request-attachments';
import {
  attachCertificate,
  certificateRequestDetailQueryKey,
  certificateRequestsListQueryKey,
  completeCertificateRequest,
  getCertificateRequest,
  pendingPurchaseCertificateRequestsQueryKey,
  purchaseCertificateRequestsListQueryKey,
  registerSupplierContact,
} from '@/services/certificate-requests/certificate-request.service';
import { capitalizeAllWords } from '@/utils/capitalize';

type CertificateRequestDetailViewProps = {
  requestId: number;
  backHref: string;
  viewer: 'stock' | 'purchase';
};

export function CertificateRequestDetailView({
  requestId,
  backHref,
  viewer,
}: CertificateRequestDetailViewProps) {
  const queryClient = useQueryClient();
  const { data: sessionUser } = useWebSession();
  const [combinedDocument, setCombinedDocument] = useState<File | null>(null);
  const isPurchaseView = viewer === 'purchase';
  const purchaseOperatorName =
    sessionUser?.name?.trim() || 'operador de compras';

  const requestQuery = useQuery({
    queryKey: certificateRequestDetailQueryKey(requestId),
    queryFn: () => getCertificateRequest(requestId),
    enabled: Number.isFinite(requestId) && requestId > 0,
  });

  const invalidateQueries = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: certificateRequestDetailQueryKey(requestId),
      }),
      queryClient.invalidateQueries({
        queryKey: certificateRequestsListQueryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: purchaseCertificateRequestsListQueryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: pendingPurchaseCertificateRequestsQueryKey,
      }),
    ]);
  };

  const registerContactMutation = useMutation({
    mutationFn: () => registerSupplierContact(requestId),
    onSuccess: async () => {
      toast.success('Envio ao fornecedor registrado.');
      await invalidateQueries();
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : 'Não foi possível registrar o envio ao fornecedor.';
      toast.error(message);
    },
  });

  const attachCertificateMutation = useMutation({
    mutationFn: () => {
      if (!combinedDocument) {
        throw new Error('Selecione o PDF com a NF e os certificados.');
      }

      return attachCertificate(requestId, {
        certificateFile: combinedDocument,
      });
    },
    onSuccess: async () => {
      toast.success('Documento confirmado. Solicitação concluída.');
      setCombinedDocument(null);
      await invalidateQueries();
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Não foi possível anexar o certificado.';
      toast.error(message);
    },
  });

  const completeRequestMutation = useMutation({
    mutationFn: () => completeCertificateRequest(requestId),
    onSuccess: async () => {
      toast.success('Solicitação concluída.');
      await invalidateQueries();
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : 'Não foi possível concluir a solicitação.';
      toast.error(message);
    },
  });

  const request = requestQuery.data;

  const invoiceAttachment = useMemo(
    () => getComparisonInvoiceAttachment(request?.attachments),
    [request?.attachments],
  );

  if (requestQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requestQuery.isError || !request) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Button asChild variant="ghost" className="w-fit">
          <Link to={backHref}>
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
        <div className="rounded-2xl bg-destructive/5 px-4 py-4">
          <p className="text-sm text-destructive">
            Não foi possível carregar a solicitação.
          </p>
        </div>
      </div>
    );
  }

  const attachedCount = request.attachedCertificatesCount ?? 0;
  const canRegisterSupplierContact =
    isPurchaseView && request.status === 'AGUARDANDO_COMPRAS';
  const canAttachCertificate =
    isPurchaseView && request.status === 'AGUARDANDO_FORNECEDOR';
  const canCompleteRequest =
    isPurchaseView &&
    request.status === 'AGUARDANDO_FORNECEDOR' &&
    attachedCount >= 1;

  const showPurchaseDocumentPendingSupplierEmail =
    isPurchaseView &&
    request.status === 'AGUARDANDO_COMPRAS' &&
    request.supplierContactAt == null &&
    invoiceAttachment != null;

  const canReplacePurchaseDocument =
    isPurchaseView &&
    request.status !== 'CANCELADA' &&
    (request.status === 'AGUARDANDO_COMPRAS' ||
      request.status === 'AGUARDANDO_FORNECEDOR' ||
      request.status === 'CONCLUIDA');

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Button asChild variant="ghost" className="-ml-2 w-fit px-2">
            <Link to={backHref}>
              <ArrowLeft className="size-4" />
              Voltar para solicitações
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                Solicitação #{request.id}
              </h1>
              <RequestStatusBadge status={request.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {request.expectedCertificates} lote
              {request.expectedCertificates === 1 ? '' : 's'} na NF
              {attachedCount > 0
                ? ' — NF com certificados anexada'
                : ' — aguardando PDF único com NF e certificados'}
              {canCompleteRequest ? ' — pronta para conclusão' : null}
            </p>
          </div>
        </div>
        {!isPurchaseView ? (
          <CancelCertificateRequestButton request={request} />
        ) : null}
      </div>

      <div
        className={
          invoiceAttachment
            ? 'grid gap-6 lg:grid-cols-3 lg:items-stretch'
            : 'grid gap-6'
        }
      >
        <section
          className={
            invoiceAttachment
              ? 'flex h-full min-h-0 flex-col rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60 sm:p-6 lg:col-span-2'
              : 'flex h-full min-h-0 flex-col rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60 sm:p-6'
          }
        >
          <h2 className="shrink-0 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Detalhes
          </h2>
          <div className="mt-4 flex min-h-0 flex-1 flex-col">
            <CertificateRequestSummary request={request} />
          </div>
        </section>

        {invoiceAttachment ? (
          <div className="flex h-full flex-col gap-3 lg:col-span-1">
            <InvoiceAttachmentCard
              attachment={invoiceAttachment}
              subtitle="Último documento anexado — estoque ou compras"
            />
            {canReplacePurchaseDocument ? (
              <PurchaseReplaceDocumentPrompt requestId={request.id} />
            ) : null}
          </div>
        ) : null}
      </div>

      {showPurchaseDocumentPendingSupplierEmail ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          Há um documento anexado na solicitação, mas o e-mail ao fornecedor
          ainda não foi registrado. Envie a solicitação ao fornecedor e confirme
          o envio na seção abaixo.
        </div>
      ) : null}

      {canRegisterSupplierContact ? (
        <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-brand" />
                <h2 className="text-base font-semibold">
                  Registrar envio ao fornecedor
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Confirme que o e-mail foi enviado ao fornecedor solicitando os
                certificados.
              </p>
            </div>
            <Button
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              disabled={registerContactMutation.isPending}
              onClick={() => registerContactMutation.mutate()}
            >
              {registerContactMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Mail className="size-4" />
              )}
              Eu, {capitalizeAllWords(purchaseOperatorName)}, enviei o e-mail ao
              fornecedor.
            </Button>
          </div>
        </section>
      ) : null}

      {canAttachCertificate ? (
        <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60 sm:p-6">
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <FileUp className="size-4 text-brand" />
              <h2 className="text-base font-semibold">
                Anexar NF com certificados
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Envie um único PDF contendo a nota fiscal e os certificados dos{' '}
              {request.expectedCertificates} lote
              {request.expectedCertificates === 1 ? '' : 's'} desta NF. Depois,
              confirme que este é o documento correto para concluir a
              solicitação.
            </p>

            <DocumentUploadField
              id="combinedDocument"
              label="NF com certificados"
              accept=".pdf"
              value={combinedDocument}
              onChange={setCombinedDocument}
              placeholder="Selecione o PDF"
              hint="Um único PDF, até 30 MB"
              buttonLabel="Escolher PDF"
            />

            {combinedDocument ? (
              <p className="text-sm text-muted-foreground">
                Confirme que o arquivo <strong>{combinedDocument.name}</strong>{' '}
                é a NF com os certificados desta solicitação.
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {canCompleteRequest ? (
                <Button
                  variant="outline"
                  disabled={completeRequestMutation.isPending}
                  onClick={() => completeRequestMutation.mutate()}
                >
                  {completeRequestMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  Concluir solicitação
                </Button>
              ) : null}
              <Button
                className="bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={
                  !combinedDocument || attachCertificateMutation.isPending
                }
                onClick={() => attachCertificateMutation.mutate()}
              >
                {attachCertificateMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                Confirmar documento
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {request.historyEvents && request.historyEvents.length > 0 ? (
        <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60 sm:p-6">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Linha do tempo
          </h2>
          <div className="mt-5">
            <RequestHistoryTimeline
              events={request.historyEvents}
              attachments={request.attachments}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
