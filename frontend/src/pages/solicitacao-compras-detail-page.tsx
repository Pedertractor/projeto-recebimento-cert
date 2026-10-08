import { useParams } from 'react-router-dom';

import { CertificateRequestDetailView } from '@/components/requests/certificate-request-detail-view';

export function SolicitacaoComprasDetailPage() {
  const { id } = useParams();
  const requestId = Number(id);

  return (
    <CertificateRequestDetailView
      requestId={requestId}
      backHref="/compras/solicitacoes"
      viewer="purchase"
    />
  );
}
