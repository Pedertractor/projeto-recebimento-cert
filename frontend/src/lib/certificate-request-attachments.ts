import type { RequestAttachment } from '@/types/certificate-request';

function isMainInvoiceAttachment(attachment: RequestAttachment): boolean {
  return (
    attachment.type === 'NOTA_FISCAL' || attachment.type === 'CERTIFICADO'
  );
}

/** Única NF da solicitação: o documento anexado mais recentemente. */
export function getComparisonInvoiceAttachment(
  attachments: RequestAttachment[] | undefined,
): RequestAttachment | null {
  const documents =
    attachments?.filter((attachment) => isMainInvoiceAttachment(attachment)) ??
    [];

  if (documents.length === 0) {
    return null;
  }

  return documents.reduce((latest, current) =>
    current.uploadedAt > latest.uploadedAt ? current : latest,
  );
}

export function getStockReferenceInvoiceAttachment(
  attachments: RequestAttachment[] | undefined,
): RequestAttachment | null {
  return getComparisonInvoiceAttachment(attachments);
}

export function getPurchaseCertificateAttachment(
  attachments: RequestAttachment[] | undefined,
): RequestAttachment | null {
  return (
    attachments?.find((attachment) => attachment.type === 'CERTIFICADO') ??
    null
  );
}
