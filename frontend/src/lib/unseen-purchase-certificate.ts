import type { CertificateRequest } from '@/types/certificate-request';

export function hasUnseenPurchaseCertificateInList(
  requests: CertificateRequest[] | undefined,
): boolean {
  return (
    requests?.some((request) => request.hasUnseenPurchaseCertificate) ?? false
  );
}
