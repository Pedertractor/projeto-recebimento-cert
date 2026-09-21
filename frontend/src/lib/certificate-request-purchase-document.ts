import { getPurchaseCertificateAttachment } from '@/lib/certificate-request-attachments';
import type { CertificateRequest } from '@/types/certificate-request';

export function canRequestPurchaseDocument(
  request: Pick<CertificateRequest, 'status' | 'attachments'> & {
    historyEvents?: Array<{ eventType: string }>;
  },
): boolean {
  if (getPurchaseCertificateAttachment(request.attachments)) {
    return false;
  }

  if (
    request.status === 'AGUARDANDO_COMPRAS' ||
    request.status === 'AGUARDANDO_FORNECEDOR' ||
    request.status === 'CONCLUIDA'
  ) {
    return false;
  }

  if (request.status === 'CADASTRADA') {
    return true;
  }

  if (request.status === 'CANCELADA') {
    return (
      request.historyEvents?.some(
        (event) => event.eventType === 'EMAIL_COMPRAS_ENVIADO',
      ) ?? false
    );
  }

  return false;
}
