import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  FileText,
  Loader2,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { LotConferenceCard } from '@/components/conference/lot-conference-card';
import { PurchaseCertificatePdfPanel } from '@/components/conference/purchase-certificate-pdf-panel';
import { QualityManagementFormSection } from '@/components/conference/quality-management-form-section';
import { InvoiceAttachmentCard } from '@/components/requests/invoice-attachment-card';
import { Button } from '@/components/ui/button';
import { formatRequestDate } from '@/lib/certificate-request-labels';
import { formatCnpjInput } from '@/utils/cnpj';
import {
  getComparisonInvoiceAttachment,
  getPurchaseCertificateAttachment,
} from '@/lib/certificate-request-attachments';
import { getQualityManagementFormColumns } from '@/lib/quality-management-form';
import {
  certificateRequestDetailQueryKey,
  getCertificateRequest,
} from '@/services/certificate-requests/certificate-request.service';
import {
  currentQualityDocumentQueryKey,
  getCurrentQualityDocument,
} from '@/services/quality-documents/quality-document.service';
import { resolveAttachmentUrl } from '@/utils/attachment-url';
import type { RequestAttachment } from '@/types/certificate-request';

function getPrintForLot(
  attachments: RequestAttachment[] | undefined,
  lotIndex: number,
) {
  return (
    attachments?.find(
      (attachment) =>
        attachment.type === 'IMPRESSAO_CONFERENCIA' &&
        attachment.lotIndex === lotIndex,
    ) ?? null
  );
}

function getPurchaseCertificate(attachments: RequestAttachment[] | undefined) {
  return getPurchaseCertificateAttachment(attachments);
}

export function NotaFiscalDetailPage() {
  const { id } = useParams();
  const requestId = Number(id);

  const requestQuery = useQuery({
    queryKey: certificateRequestDetailQueryKey(requestId),
    queryFn: () => getCertificateRequest(requestId),
    enabled: Number.isFinite(requestId) && requestId > 0,
  });

  const qualityDocumentQuery = useQuery({
    queryKey: currentQualityDocumentQueryKey,
    queryFn: getCurrentQualityDocument,
  });

  const request = requestQuery.data;
  const invoiceAttachment = useMemo(
    () => getComparisonInvoiceAttachment(request?.attachments),
    [request?.attachments],
  );

  const purchaseCertificate = useMemo(
    () => getPurchaseCertificate(request?.attachments),
    [request?.attachments],
  );

  const conferencePrintCount = useMemo(
    () =>
      request?.attachments?.filter(
        (attachment) => attachment.type === 'IMPRESSAO_CONFERENCIA',
      ).length ?? 0,
    [request?.attachments],
  );

  const qualityFormColumns = useMemo(
    () =>
      request
        ? getQualityManagementFormColumns(
            request.attachments,
            request.expectedCertificates,
            request.supplier.name,
          )
        : [],
    [request],
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
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <Button asChild variant="ghost" className="w-fit">
          <Link to="/notas-fiscais">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
        <div className="rounded-2xl bg-destructive/5 px-4 py-4">
          <p className="text-sm text-destructive">
            Não foi possível carregar a nota fiscal.
          </p>
        </div>
      </div>
    );
  }

  const lotIndexes = Array.from(
    { length: request.expectedCertificates },
    (_, index) => index + 1,
  );

  const qualityDocument = qualityDocumentQuery.data;
  const printsMismatch =
    conferencePrintCount > 0 &&
    conferencePrintCount !== request.expectedCertificates;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Button asChild variant="ghost" className="-ml-2 w-fit px-2">
        <Link to="/notas-fiscais">
          <ArrowLeft className="size-4" />
          Voltar para NF&apos;s
        </Link>
      </Button>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-brand px-5 py-4 text-brand-foreground shadow-sm">
            <p className="text-xs uppercase tracking-wide opacity-80">NF</p>
            <p className="mt-1 text-2xl font-semibold">
              {request.invoiceNumber}
            </p>
          </div>
          <div className="rounded-2xl bg-brand px-5 py-4 text-brand-foreground shadow-sm">
            <p className="text-xs uppercase tracking-wide opacity-80">
              Data NF
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {formatRequestDate(request.invoiceDate)}
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-brand px-5 py-4 text-brand-foreground shadow-sm lg:min-w-44">
          <p className="text-xs uppercase tracking-wide opacity-80">
            Certificados
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {request.expectedCertificates}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-card px-5 py-4 shadow-sm ring-1 ring-border/60">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Fornecedor
            </p>
            <p className="font-medium">{request.supplier.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatCnpjInput(request.supplier.cnpj)}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Qtd de lotes: {request.expectedCertificates}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4 shadow-sm ring-1 ring-border/60">
        <div className="flex items-center gap-3">
          <FileText className="size-5 text-brand" />
          <div>
            <p className="text-sm font-medium">
              {qualityDocument?.displayName ?? 'Documento de qualidade'}
            </p>
            <p className="text-xs text-muted-foreground">
              Versão atual usada na conferência
            </p>
          </div>
        </div>
        {qualityDocument ? (
          <Button asChild variant="outline" size="sm">
            <a
              href={resolveAttachmentUrl(qualityDocument.storagePath)}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="size-4" />
              Abrir
            </a>
          </Button>
        ) : null}
      </div>

      {printsMismatch ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>
            A quantidade de certificados deve ser igual à quantia de lotes (
            {request.expectedCertificates} lotes). Atualmente:{' '}
            {conferencePrintCount} impressão(ões) anexada(s).
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Certificados por lote</h2>
            <p className="text-sm text-muted-foreground">
              Anexe uma impressão por lote e faça a comparação com o documento
              de qualidade.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {lotIndexes.map((lotIndex) => (
              <LotConferenceCard
                key={lotIndex}
                requestId={request.id}
                lotIndex={lotIndex}
                printAttachment={getPrintForLot(request.attachments, lotIndex)}
                purchaseCertificate={getPurchaseCertificate(
                  request.attachments,
                )}
              />
            ))}
          </div>
        </section>

        <div className="space-y-4">
          {purchaseCertificate ? (
            <PurchaseCertificatePdfPanel attachment={purchaseCertificate} />
          ) : null}
          <InvoiceAttachmentCard
            attachment={invoiceAttachment}
            subtitle="Retorno do compras — usada na conferência"
            emptyMessage="Aguardando nota fiscal retornada pelo compras."
          />
        </div>
      </div>

      <QualityManagementFormSection
        columns={qualityFormColumns}
        invoiceNumber={request.invoiceNumber}
      />
    </div>
  );
}
