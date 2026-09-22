import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { CertificateRequestsTable } from '@/components/requests/certificate-requests-table';
import {
  listPurchaseCertificateRequests,
  purchaseCertificateRequestsListQueryKey,
} from '@/services/certificate-requests/certificate-request.service';

export function SolicitacoesComprasPage() {
  const requestsQuery = useQuery({
    queryKey: purchaseCertificateRequestsListQueryKey,
    queryFn: listPurchaseCertificateRequests,
  });

  return (
    <div className="page-container">
      <div>
        <h1 className="page-heading">Solicitações ao compras</h1>
        <p className="page-lead">
          Solicitações abertas pelo estoque para contato com fornecedores e
          anexo de certificados.
        </p>
      </div>

      {requestsQuery.isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {requestsQuery.isError ? (
        <div className="rounded-2xl bg-destructive/5 px-4 py-4">
          <p className="text-sm text-destructive">
            Não foi possível carregar as solicitações.
          </p>
        </div>
      ) : null}

      {requestsQuery.isSuccess ? (
        <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60">
          <CertificateRequestsTable
            requests={requestsQuery.data}
            variant="purchase"
            detailPath={(id) => `/compras/solicitacoes/${id}`}
          />
        </div>
      ) : null}
    </div>
  );
}
