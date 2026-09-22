import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { CertificateRequestsTable } from '@/components/requests/certificate-requests-table';
import { NfConferenceFilters } from '@/components/requests/nf-conference-filters';
import {
  buildNfConferenceFiltersSummary,
  filterNfConferenceRequests,
  hasActiveNfConferenceFilters,
  type NfConferenceStatusFilter,
} from '@/lib/nf-conference-filters';
import {
  completedCertificateRequestsQueryKey,
  listCompletedCertificateRequests,
} from '@/services/certificate-requests/certificate-request.service';

export function NotasFiscaisPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<NfConferenceStatusFilter>('ALL');

  const requestsQuery = useQuery({
    queryKey: completedCertificateRequestsQueryKey,
    queryFn: listCompletedCertificateRequests,
  });

  const filteredRequests = useMemo(
    () =>
      filterNfConferenceRequests(
        requestsQuery.data ?? [],
        search,
        statusFilter,
      ),
    [requestsQuery.data, search, statusFilter],
  );

  const totalCount = requestsQuery.data?.length ?? 0;

  const filtersSummary = buildNfConferenceFiltersSummary(
    search,
    statusFilter,
    filteredRequests.length,
    totalCount,
  );

  const hasActiveFilters = hasActiveNfConferenceFilters(search, statusFilter);

  function resetFilters() {
    setSearch('');
    setStatusFilter('ALL');
  }

  return (
    <div className="page-container">
      <div>
        <h1 className="page-heading">NF&apos;s de materiais</h1>
        <p className="page-lead">
          Solicitações e NFs cadastradas prontas para conferência de
          certificados por lote.
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
        <div className="flex flex-col gap-4">
          <NfConferenceFilters
            search={search}
            statusFilter={statusFilter}
            filtersSummary={filtersSummary}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearch}
            onStatusFilterChange={setStatusFilter}
            onReset={resetFilters}
          />

          <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60">
            <CertificateRequestsTable
              requests={filteredRequests}
              variant="conference"
              detailPath={(id) => `/notas-fiscais/${id}`}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
