import { useParams } from 'react-router-dom';

import { CertificateRequestDetailView } from '@/components/requests/certificate-request-detail-view';

export function SolicitacaoEstoqueDetailPage() {
  const { id } = useParams();
  const requestId = Number(id);

  return (
    <CertificateRequestDetailView
      requestId={requestId}
      backHref="/minhas-solicitacoes"
      viewer="stock"
    />
  );
}
