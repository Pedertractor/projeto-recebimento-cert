import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { CertificateRequestTableFilters } from '@/components/requests/certificate-request-table-filters';
import { CertificateRequestsTable } from '@/components/requests/certificate-requests-table';
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
      filterCertificateRequestList(
        requestsQuery.data ?? [],
        search,
        statusFilter,
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

          <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60">
            <CertificateRequestsTable
              requests={filteredRequests}
              variant="purchase"
              detailPath={(id) => `/compras/solicitacoes/${id}`}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
