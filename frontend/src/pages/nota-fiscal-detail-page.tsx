import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { InvoiceCertificatePrompt } from '@/components/conference/invoice-certificate-prompt';
import { LotConferenceCard } from '@/components/conference/lot-conference-card';
import { QualityManagementFormSection } from '@/components/conference/quality-management-form-section';
import { InvoiceAttachmentCard } from '@/components/requests/invoice-attachment-card';
import { NfInfoCards } from '@/components/requests/nf-info-cards';
import { PurchaseRequestWaitingBanner } from '@/components/requests/purchase-request-waiting-banner';
import { Button } from '@/components/ui/button';
import {
  getComparisonInvoiceAttachment,
  getPurchaseCertificateAttachment,
} from '@/lib/certificate-request-attachments';
import { getQualityManagementFormColumns } from '@/lib/quality-management-form';
import {
  certificateRequestDetailQueryKey,
  getCertificateRequest,
} from '@/services/certificate-requests/certificate-request.service';
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

  const qualityDocument = request.qualityDocument ?? undefined;
  const printsMismatch =
    conferencePrintCount > 0 &&
    conferencePrintCount !== request.expectedCertificates;
  const waitingPurchaseDocument =
    !purchaseCertificate &&
    (request.status === 'AGUARDANDO_COMPRAS' ||
      request.status === 'AGUARDANDO_FORNECEDOR');

  return (
    <div className="page-container">
      <Button asChild variant="ghost" className="-ml-2 w-fit px-2">
        <Link to="/notas-fiscais">
          <ArrowLeft className="size-4" />
          Voltar para NF&apos;s
        </Link>
      </Button>

      <NfInfoCards request={request} qualityDocument={qualityDocument} />

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

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="order-2 min-w-0 space-y-4 lg:order-1">
          <div>
            <h2 className="text-base font-semibold md:text-lg">
              Certificados por lote
            </h2>
            <p className="text-sm text-muted-foreground">
              Anexe uma impressão por lote e faça a comparação com o documento
              de qualidade.
            </p>
          </div>

          {waitingPurchaseDocument ? (
            <PurchaseRequestWaitingBanner request={request} />
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {lotIndexes.map((lotIndex) => (
              <LotConferenceCard
                key={lotIndex}
                requestId={request.id}
                lotIndex={lotIndex}
                printAttachment={getPrintForLot(request.attachments, lotIndex)}
                purchaseCertificate={invoiceAttachment}
              />
            ))}
          </div>

          <InvoiceCertificatePrompt request={request} />
        </section>

        <div className="order-1 min-w-0 space-y-4 lg:order-2">
          <InvoiceAttachmentCard
            attachment={invoiceAttachment}
            requestId={request.id}
            canUpdate={request.status !== 'CANCELADA'}
            subtitle={
              invoiceAttachment
                ? 'Último documento anexado — estoque ou compras'
                : undefined
            }
            emptyMessage="Nenhuma nota fiscal anexada. Você pode incluir depois."
          />
        </div>
      </div>

      <QualityManagementFormSection columns={qualityFormColumns} />
    </div>
  );
}
