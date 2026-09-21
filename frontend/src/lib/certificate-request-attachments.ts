import type { RequestAttachment } from '@/types/certificate-request';

function hasPurchaseResponse(
  attachments: RequestAttachment[] | undefined,
): boolean {
  return (
    attachments?.some((attachment) => attachment.type === 'CERTIFICADO') ??
    false
  );
}

/** Documento válido da conferência: PDF do compras, senão a NF do estoque. */
export function getComparisonInvoiceAttachment(
  attachments: RequestAttachment[] | undefined,
): RequestAttachment | null {
  return (
    getPurchaseCertificateAttachment(attachments) ??
    attachments?.find((attachment) => attachment.type === 'NOTA_FISCAL') ??
    null
  );
}

/** NF opcional enviada pelo estoque na abertura da solicitação. */
export function getStockReferenceInvoiceAttachment(
  attachments: RequestAttachment[] | undefined,
): RequestAttachment | null {
  if (hasPurchaseResponse(attachments)) {
    return null;
  }

  return (
    attachments?.find((attachment) => attachment.type === 'NOTA_FISCAL') ??
    null
  );
}

export function getPurchaseCertificateAttachment(
  attachments: RequestAttachment[] | undefined,
): RequestAttachment | null {
  return (
    attachments?.find((attachment) => attachment.type === 'CERTIFICADO') ??
    null
  );
}
