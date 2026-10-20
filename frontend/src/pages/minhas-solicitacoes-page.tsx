import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { CertificateRequestTableFilters } from '@/components/requests/certificate-request-table-filters';
import { StockRequestCards } from '@/components/requests/stock-request-cards';
import { Button } from '@/components/ui/button';
import { useWebSession } from '@/hooks/auth/use-web-session';
import { canViewUnseenPurchaseCertificateIndicators } from '@/lib/role-access';
import {
  buildCertificateRequestListFiltersSummary,
  filterCertificateRequestList,
  hasActiveCertificateRequestListFilters,
  STOCK_REQUEST_STATUS_FILTER_OPTIONS,
  type RequestListStatusFilter,
} from '@/lib/certificate-request-table-filters';
import {
  certificateRequestsListQueryKey,
  listCertificateRequests,
} from '@/services/certificate-requests/certificate-request.service';

export function MinhasSolicitacoesPage() {
  const { data: sessionUser } = useWebSession();
  const showUnseenPurchaseCertificateIndicators =
    canViewUnseenPurchaseCertificateIndicators(sessionUser?.role);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<RequestListStatusFilter>('ALL');

  const requestsQuery = useQuery({
    queryKey: certificateRequestsListQueryKey,
    queryFn: listCertificateRequests,
  });

  const visibleRequests = useMemo(() => {
    return requestsQuery.data ?? [];
  }, [requestsQuery.data]);

  const filteredRequests = useMemo(
    () => filterCertificateRequestList(visibleRequests, search, statusFilter),
    [visibleRequests, search, statusFilter],
  );

  const totalCount = visibleRequests.length;
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
          <h1 className="page-heading">Solicitações</h1>
          <p className="page-lead">
            {showUnseenPurchaseCertificateIndicators
              ? 'Solicitações em aberto de toda a equipe de estoque e NFs com certificado novo do compras aguardando visualização pela operação.'
              : 'Solicitações em aberto de toda a equipe de estoque.'}
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
            statusOptions={STOCK_REQUEST_STATUS_FILTER_OPTIONS}
            filtersSummary={filtersSummary}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearch}
            onStatusFilterChange={setStatusFilter}
            onReset={resetFilters}
          />

          <StockRequestCards
            requests={filteredRequests}
            detailPath={(id) => `/minhas-solicitacoes/${id}`}
            nfPath={(id) => `/notas-fiscais/${id}`}
            showUnseenPurchaseCertificateIndicators={
              showUnseenPurchaseCertificateIndicators
            }
          />
        </div>
      ) : null}
    </div>
  );
}
