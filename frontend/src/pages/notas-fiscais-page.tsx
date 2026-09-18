import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { CertificateRequestsTable } from '@/components/requests/certificate-requests-table';
import {
  completedCertificateRequestsQueryKey,
  listCompletedCertificateRequests,
} from '@/services/certificate-requests/certificate-request.service';

export function NotasFiscaisPage() {
  const requestsQuery = useQuery({
    queryKey: completedCertificateRequestsQueryKey,
    queryFn: listCompletedCertificateRequests,
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          NF&apos;s de materiais
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Solicitações concluídas prontas para conferência de certificados por
          lote.
        </p>
      </div>

      {requestsQuery.isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {requestsQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Não foi possível carregar as notas fiscais.
          </p>
        </div>
      ) : null}

      {requestsQuery.isSuccess ? (
        <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60">
          <CertificateRequestsTable
            requests={requestsQuery.data}
            variant="stock"
            detailPath={(id) => `/notas-fiscais/${id}`}
          />
        </div>
      ) : null}
    </div>
  );
}
