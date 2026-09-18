import type { RequestAttachment } from '@/types/certificate-request';

function hasPurchaseResponse(
  attachments: RequestAttachment[] | undefined,
): boolean {
  return (
    attachments?.some((attachment) => attachment.type === 'CERTIFICADO') ??
    false
  );
}

/** NF retornada pelo compras na resposta — usada na conferência. */
export function getComparisonInvoiceAttachment(
  attachments: RequestAttachment[] | undefined,
): RequestAttachment | null {
  if (!hasPurchaseResponse(attachments)) {
    return null;
  }

  return (
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
