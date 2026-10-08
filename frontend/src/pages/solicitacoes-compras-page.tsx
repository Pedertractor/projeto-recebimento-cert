import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { CertificateRequestTableFilters } from '@/components/requests/certificate-request-table-filters';
import {
  PurchaseRequestCards,
  PurchaseRequestStatusLegend,
} from '@/components/requests/purchase-request-cards';
import {
  buildCertificateRequestListFiltersSummary,
  filterCertificateRequestList,
  hasActiveCertificateRequestListFilters,
  PURCHASE_REQUEST_STATUS_FILTER_OPTIONS,
  type RequestListStatusFilter,
} from '@/lib/certificate-request-table-filters';
import {
  listPurchaseCertificateRequests,
  purchaseCertificateRequestsListQueryKey,
} from '@/services/certificate-requests/certificate-request.service';
import type { CertificateRequest } from '@/types/certificate-request';

const OPEN_STATUS_RANK: Record<CertificateRequest['status'], number> = {
  AGUARDANDO_COMPRAS: 0,
  AGUARDANDO_FORNECEDOR: 1,
  CONCLUIDA: 2,
  CANCELADA: 3,
  CADASTRADA: 4,
};

function sortPurchaseRequestsForCards(
  requests: CertificateRequest[],
): CertificateRequest[] {
  return [...requests].sort((left, right) => {
    const rankDiff =
      OPEN_STATUS_RANK[left.status] - OPEN_STATUS_RANK[right.status];
    if (rankDiff !== 0) {
      return rankDiff;
    }

    const leftTime = new Date(left.submittedAt).getTime();
    const rightTime = new Date(right.submittedAt).getTime();
    if (left.status === 'CONCLUIDA' || left.status === 'CANCELADA') {
      return rightTime - leftTime;
    }

    return leftTime - rightTime;
  });
}

export function SolicitacoesComprasPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<RequestListStatusFilter>('ALL');

  const requestsQuery = useQuery({
    queryKey: purchaseCertificateRequestsListQueryKey,
    queryFn: listPurchaseCertificateRequests,
  });

  const filteredRequests = useMemo(
    () =>
      sortPurchaseRequestsForCards(
        filterCertificateRequestList(
          requestsQuery.data ?? [],
          search,
          statusFilter,
        ),
      ),
    [requestsQuery.data, search, statusFilter],
  );

  const totalCount = requestsQuery.data?.length ?? 0;
  const filtersSummary = buildCertificateRequestListFiltersSummary(
    search,
    statusFilter,
    filteredRequests.length,
    totalCount,
  );
  const hasActiveFilters = hasActiveCertificateRequestListFilters(
    search,
    statusFilter,
  );

  function resetFilters() {
    setSearch('');
    setStatusFilter('ALL');
  }

  return (
    <div className="page-container md:max-w-none">
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
        <div className="flex flex-col gap-4">
          <CertificateRequestTableFilters
            searchInputId="purchase-requests-search"
            searchPlaceholder="NF, fornecedor, CNPJ, solicitante ou nº da solicitação"
            search={search}
            statusFilter={statusFilter}
            statusOptions={PURCHASE_REQUEST_STATUS_FILTER_OPTIONS}
            filtersSummary={filtersSummary}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearch}
            onStatusFilterChange={setStatusFilter}
            onReset={resetFilters}
          />

          <PurchaseRequestStatusLegend />

          <PurchaseRequestCards requests={filteredRequests} />
        </div>
      ) : null}
    </div>
  );
}
