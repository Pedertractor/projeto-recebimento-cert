import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { CertificateRequestTableFilters } from '@/components/requests/certificate-request-table-filters';
import { CertificateRequestsTable } from '@/components/requests/certificate-requests-table';
import { Button } from '@/components/ui/button';
import {
  buildCertificateRequestListFiltersSummary,
  filterCertificateRequestList,
  hasActiveCertificateRequestListFilters,
  STOCK_REQUEST_STATUS_FILTER_OPTIONS,
  type RequestListStatusFilter,
} from '@/lib/certificate-request-table-filters';
import { useWebSession } from '@/hooks/auth/use-web-session';
import { isStockLeaderRole, isSuperAdminRole } from '@/lib/user-labels';
import {
  certificateRequestsListQueryKey,
  listCertificateRequests,
} from '@/services/certificate-requests/certificate-request.service';

export function MinhasSolicitacoesPage() {
  const { data: user } = useWebSession();
  const isStockLeader = isStockLeaderRole(user?.role);
  const canSeeCancelledRequests =
    isStockLeader || isSuperAdminRole(user?.role);
  const statusOptions = canSeeCancelledRequests
    ? STOCK_REQUEST_STATUS_FILTER_OPTIONS
    : STOCK_REQUEST_STATUS_FILTER_OPTIONS.filter(
        (option) => option.value !== 'CANCELADA',
      );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<RequestListStatusFilter>('ALL');

  const requestsQuery = useQuery({
    queryKey: certificateRequestsListQueryKey,
    queryFn: listCertificateRequests,
  });

  const openRequests = useMemo(() => {
    const requests = requestsQuery.data ?? [];

    return requests.filter((request) => {
      if (
        request.status === 'AGUARDANDO_COMPRAS' ||
        request.status === 'AGUARDANDO_FORNECEDOR'
      ) {
        return true;
      }

      return canSeeCancelledRequests && request.status === 'CANCELADA';
    });
  }, [canSeeCancelledRequests, requestsQuery.data]);

  const filteredRequests = useMemo(
    () => filterCertificateRequestList(openRequests, search, statusFilter),
    [openRequests, search, statusFilter],
  );

  const totalCount = openRequests.length;
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="page-heading">
            {isStockLeader ? 'Solicitações' : 'Minhas solicitações'}
          </h1>
          <p className="page-lead">
            {canSeeCancelledRequests
              ? 'Solicitações em aberto enviadas ao compras, de cada solicitante.'
              : 'Somente as suas solicitações em aberto enviadas ao compras.'}
          </p>
        </div>
        <Button
          asChild
          className="w-full bg-brand text-brand-foreground hover:bg-brand/90 sm:w-auto"
        >
          <Link to="/cadastrar-nf">Cadastrar NF</Link>
        </Button>
      </div>

      {requestsQuery.isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {requestsQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Não foi possível carregar as solicitações.
          </p>
        </div>
      ) : null}

      {requestsQuery.isSuccess ? (
        <div className="flex flex-col gap-4">
          <CertificateRequestTableFilters
            searchInputId="stock-requests-search"
            searchPlaceholder="NF, fornecedor, CNPJ ou nº da solicitação"
            search={search}
            statusFilter={statusFilter}
            statusOptions={statusOptions}
            filtersSummary={filtersSummary}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearch}
            onStatusFilterChange={setStatusFilter}
            onReset={resetFilters}
          />

          <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60">
            <CertificateRequestsTable
              requests={filteredRequests}
              variant="stock"
              showRequestCreator={isStockLeader}
              detailPath={(id) => `/minhas-solicitacoes/${id}`}
              nfShortcutPath={(id) => `/notas-fiscais/${id}`}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
