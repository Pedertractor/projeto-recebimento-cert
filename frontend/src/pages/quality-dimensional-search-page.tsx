import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { QualityDimensionalFiltersPanel } from '@/components/quality/quality-dimensional-filters';
import { QualityDimensionalResultsTable } from '@/components/quality/quality-dimensional-results-table';
import {
  buildQualityDimensionalFiltersSummary,
  EMPTY_QUALITY_DIMENSIONAL_FILTERS,
  hasActiveQualityDimensionalFilters,
  hasDimensionalSearchCriteria,
  searchQualityDimensionalMatches,
  type QualityDimensionalFilters,
} from '@/lib/quality-dimensional-filters';
import {
  buildQualityDimensionalSearchPath,
  filtersToSearchParams,
  mergeFiltersWithSearchParams,
} from '@/lib/quality-dimensional-search-params';
import {
  completedCertificateRequestsQueryKey,
  listCompletedCertificateRequests,
} from '@/services/certificate-requests/certificate-request.service';

export function QualityDimensionalSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<QualityDimensionalFilters>(() =>
    mergeFiltersWithSearchParams(searchParams),
  );

  useEffect(() => {
    const next = filtersToSearchParams(filters).toString();
    const current = searchParams.toString();
    if (next === current) {
      return;
    }
    setSearchParams(next ? new URLSearchParams(next) : {}, { replace: true });
  }, [filters, searchParams, setSearchParams]);

  const requestsQuery = useQuery({
    queryKey: completedCertificateRequestsQueryKey,
    queryFn: listCompletedCertificateRequests,
  });

  const matches = useMemo(() => {
    if (!requestsQuery.data) {
      return [];
    }

    return searchQualityDimensionalMatches(requestsQuery.data, filters);
  }, [requestsQuery.data, filters]);

  const filtersSummary = buildQualityDimensionalFiltersSummary(
    filters,
    matches.length,
  );

  const hasActiveFilters = hasActiveQualityDimensionalFilters(filters);
  const canSearch = hasDimensionalSearchCriteria(filters);

  function resetFilters() {
    setFilters(EMPTY_QUALITY_DIMENSIONAL_FILTERS);
  }

  const comparisonReturnTo = buildQualityDimensionalSearchPath(filters);

  return (
    <div className="page-container">
      <div>
        <h1 className="page-heading">Busca por dimensionais</h1>
        <p className="page-lead">
          Encontre NFs com certificados conferidos pela espessura, largura ou
          comprimento — na NF ou no recebimento.
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
            Não foi possível carregar as notas fiscais para a busca.
          </p>
        </div>
      ) : null}

      {requestsQuery.isSuccess ? (
        <div className="flex flex-col gap-4">
          <QualityDimensionalFiltersPanel
            filters={filters}
            filtersSummary={filtersSummary}
            hasActiveFilters={hasActiveFilters}
            onChange={setFilters}
            onReset={resetFilters}
          />

          {!canSearch ? (
            <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                Informe ao menos um dimensional para iniciar a busca.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ex.: espessura 12,50 · largura 1,200 · comprimento 3,000
              </p>
            </div>
          ) : (
            <QualityDimensionalResultsTable
              matches={matches}
              comparisonReturnTo={comparisonReturnTo}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
