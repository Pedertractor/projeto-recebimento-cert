import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, FileUp, Loader2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { CancelCertificateRequestButton } from '@/components/requests/cancel-certificate-request-button';
import { CertificateRequestSummary } from '@/components/requests/certificate-request-summary';
import { InvoiceAttachmentCard } from '@/components/requests/invoice-attachment-card';
import { RequestAttachmentActions } from '@/components/requests/request-attachment-actions';
import { RequestHistoryTimeline } from '@/components/requests/request-history-timeline';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { Button } from '@/components/ui/button';
import { DocumentUploadField } from '@/components/ui/document-upload-field';
import { HttpClientError } from '@/lib/http-client';
import {
  getComparisonInvoiceAttachment,
  getStockReferenceInvoiceAttachment,
} from '@/lib/certificate-request-attachments';
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
import type { RequestAttachment } from '@/types/certificate-request';

type CertificateRequestDetailViewProps = {
  requestId: number;
  backHref: string;
  viewer: 'stock' | 'purchase';
};

function AttachmentListItem({ attachment }: { attachment: RequestAttachment }) {
  return <RequestAttachmentActions attachment={attachment} />;
}

export function CertificateRequestDetailView({
  requestId,
  backHref,
  viewer,
}: CertificateRequestDetailViewProps) {
  const queryClient = useQueryClient();
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const isPurchaseView = viewer === 'purchase';

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
      if (!certificateFile) {
        throw new Error('Selecione o PDF com os certificados.');
      }

      if (!invoiceFile) {
        throw new Error('Selecione a nota fiscal retornada.');
      }

      return attachCertificate(requestId, {
        certificateFile,
        invoiceFile,
      });
    },
    onSuccess: async (updatedRequest) => {
      if (updatedRequest.status === 'CONCLUIDA') {
        toast.success(
          'Certificado e nota fiscal anexados. Solicitação concluída.',
        );
      } else {
        toast.success('Certificado e nota fiscal anexados.');
      }
      setCertificateFile(null);
      setInvoiceFile(null);
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

  const invoiceAttachment = useMemo(() => {
    const comparison = getComparisonInvoiceAttachment(request?.attachments);
    if (comparison) {
      return comparison;
    }

    if (isPurchaseView || request?.status === 'CONCLUIDA') {
      return null;
    }

    return getStockReferenceInvoiceAttachment(request?.attachments);
  }, [isPurchaseView, request?.attachments, request?.status]);

  const certificateAttachments = useMemo(
    () =>
      request?.attachments?.filter(
        (attachment) => attachment.type === 'CERTIFICADO',
      ) ?? [],
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
                ? ' — PDF de certificados anexado'
                : ' — aguardando PDF único com todos os certificados'}
              {canCompleteRequest ? ' — pronta para conclusão' : null}
            </p>
          </div>
        </div>
        {!isPurchaseView ? (
          <CancelCertificateRequestButton request={request} />
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
        <section className="flex h-full min-h-0 flex-col rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60 sm:p-6 lg:col-span-2">
          <h2 className="shrink-0 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Detalhes
          </h2>
          <div className="mt-4 flex min-h-0 flex-1 flex-col">
            <CertificateRequestSummary request={request} />
          </div>
        </section>

        <div className="h-full lg:col-span-1">
          <InvoiceAttachmentCard
            attachment={invoiceAttachment}
            subtitle={
              isPurchaseView
                ? 'Anexe na resposta ao concluir a solicitação'
                : getComparisonInvoiceAttachment(request.attachments)
                  ? 'Retorno do compras — usada na conferência'
                  : invoiceAttachment
                    ? 'Referência opcional enviada pelo estoque'
                    : undefined
            }
            emptyMessage={
              isPurchaseView
                ? 'Anexe a nota fiscal ao responder a solicitação.'
                : 'Aguardando nota fiscal retornada pelo compras.'
            }
          />
        </div>
      </div>

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
              Registrar envio
            </Button>
          </div>
        </section>
      ) : null}

      {canAttachCertificate ? (
        <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60 sm:p-6">
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <FileUp className="size-4 text-brand" />
              <h2 className="text-base font-semibold">Anexar certificados</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Envie a nota fiscal e um único PDF contendo os certificados dos{' '}
              {request.expectedCertificates} lote
              {request.expectedCertificates === 1 ? '' : 's'} desta NF. A
              solicitação será concluída ao anexar os arquivos.
            </p>

            <DocumentUploadField
              id="invoiceFile"
              label="Nota fiscal"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              value={invoiceFile}
              onChange={setInvoiceFile}
              placeholder="Selecione a NF"
              hint="PDF ou imagem, até 10 MB"
              buttonLabel="Escolher NF"
            />

            <DocumentUploadField
              id="certificateFile"
              label="PDF com todos os certificados"
              accept=".pdf"
              value={certificateFile}
              onChange={setCertificateFile}
              placeholder="Selecione o PDF"
              hint="Um único PDF, até 10 MB"
              buttonLabel="Escolher PDF"
            />

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
                  !certificateFile ||
                  !invoiceFile ||
                  attachCertificateMutation.isPending
                }
                onClick={() => attachCertificateMutation.mutate()}
              >
                {attachCertificateMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileUp className="size-4" />
                )}
                Anexar e concluir
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {certificateAttachments.length > 0 ? (
        <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60 sm:p-6">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            PDF de certificados
          </h2>
          <div className="mt-4 space-y-2">
            {certificateAttachments.map((attachment) => (
              <AttachmentListItem key={attachment.id} attachment={attachment} />
            ))}
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
