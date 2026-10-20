import { useQuery } from '@tanstack/react-query';

import { hasUnseenPurchaseCertificateInList } from '@/lib/unseen-purchase-certificate';
import {
  certificateRequestsListQueryKey,
  listCertificateRequests,
} from '@/services/certificate-requests/certificate-request.service';

export function useHasUnseenPurchaseCertificate(enabled: boolean) {
  const query = useQuery({
    queryKey: certificateRequestsListQueryKey,
    queryFn: listCertificateRequests,
    enabled,
  });

  return hasUnseenPurchaseCertificateInList(query.data);
}
