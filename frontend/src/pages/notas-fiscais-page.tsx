import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { CertificateRequestsTable } from '@/components/requests/certificate-requests-table';
import { Button } from '@/components/ui/button';
import { NfConferenceFilters } from '@/components/requests/nf-conference-filters';
import { useWebSession } from '@/hooks/auth/use-web-session';
import { canExportNfConferenceExcel } from '@/lib/role-access';
import {
  buildNfConferenceFiltersSummary,
  filterNfConferenceRequests,
  hasActiveNfConferenceFilters,
  type NfConferenceStatusFilter,
} from '@/lib/nf-conference-filters';
import {
  exportNfConferenceTableToExcel,
  listNfsEmConferenciaComComparacoesPendentes,
} from '@/lib/export-nf-conference-excel';
import {
  completedCertificateRequestsQueryKey,
  listCompletedCertificateRequests,
} from '@/services/certificate-requests/certificate-request.service';

export function NotasFiscaisPage() {
  const { data: sessionUser } = useWebSession();
  const canExportExcel = canExportNfConferenceExcel(sessionUser?.role);
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

  const nfsParaExportarExcel = useMemo(
    () =>
      listNfsEmConferenciaComComparacoesPendentes(requestsQuery.data ?? []),
    [requestsQuery.data],
  );

  async function handleExportExcel() {
    if (!canExportExcel) {
      return;
    }

    if (nfsParaExportarExcel.length === 0) {
      toast.info('Não há NFs em conferência com comparações pendentes.');
      return;
    }

    try {
      await exportNfConferenceTableToExcel(nfsParaExportarExcel);
      toast.success(
        `${nfsParaExportarExcel.length} NF${nfsParaExportarExcel.length === 1 ? '' : 's'} exportada${nfsParaExportarExcel.length === 1 ? '' : 's'}.`,
      );
    } catch {
      toast.error('Não foi possível gerar o arquivo Excel.');
    }
  }

  function resetFilters() {
    setSearch('');
    setStatusFilter('ALL');
  }

  return (
    <div className="page-container">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-heading">NF&apos;s de materiais</h1>
          <p className="page-lead">
            Solicitações e NFs cadastradas prontas para conferência de
            certificados por lote.
          </p>
        </div>

        {requestsQuery.isSuccess && canExportExcel ? (
          <Button
            type="button"
            variant="outline"
            className="shrink-0 gap-2"
            onClick={handleExportExcel}
            disabled={nfsParaExportarExcel.length === 0}
          >
            <FileSpreadsheet className="size-4" aria-hidden />
            Exportar Excel
          </Button>
        ) : null}
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
