import type {
  CertificateInspection,
  CertificateRequest,
} from '@/types/certificate-request';
import { normalizeStoredDimensionalValue } from '@/utils/dimensional-input';

export type QualityDimensionalSource = 'specified' | 'found';

export type QualityDimensionalDimensions = {
  thickness: string;
  width: string;
  length: string;
};

export type QualityDimensionalFilters = {
  matchSpecified: boolean;
  matchFound: boolean;
  thickness: string;
  width: string;
  length: string;
};

export const QUALITY_DIMENSIONAL_SOURCE_OPTIONS: Array<{
  value: QualityDimensionalSource;
  label: string;
  description: string;
}> = [
  {
    value: 'specified',
    label: 'Especificado na NF',
    description: 'Inclui o dimensional informado na nota fiscal.',
  },
  {
    value: 'found',
    label: 'Encontrado no recebimento',
    description: 'Inclui o dimensional medido na conferência.',
  },
];

export const EMPTY_QUALITY_DIMENSIONAL_FILTERS: QualityDimensionalFilters = {
  matchSpecified: true,
  matchFound: false,
  thickness: '',
  width: '',
  length: '',
};

export type QualityDimensionalSearchMatch = {
  requestId: number;
  attachmentId: string;
  invoiceNumber: string;
  supplierName: string;
  lotIndex: number;
  lotLabel: string;
  specified: QualityDimensionalDimensions;
  found: QualityDimensionalDimensions;
  inspectedAt: string;
};

function getDimensionsForSource(
  inspection: CertificateInspection,
  source: QualityDimensionalSource,
): QualityDimensionalDimensions {
  if (source === 'specified') {
    return {
      thickness: inspection.dimensionalSpecifiedThickness,
      width: inspection.dimensionalSpecifiedWidth,
      length: inspection.dimensionalSpecifiedLength,
    };
  }

  return {
    thickness: inspection.dimensionalFoundThickness,
    width: inspection.dimensionalFoundWidth,
    length: inspection.dimensionalFoundLength,
  };
}

function normalizeCriteria(filters: QualityDimensionalFilters) {
  return {
    thickness: filters.thickness.trim()
      ? normalizeStoredDimensionalValue(filters.thickness, 2)
      : '',
    width: filters.width.trim()
      ? normalizeStoredDimensionalValue(filters.width, 3)
      : '',
    length: filters.length.trim()
      ? normalizeStoredDimensionalValue(filters.length, 3)
      : '',
  };
}

function dimensionsMatchCriteria(
  dimensions: QualityDimensionalDimensions,
  criteria: ReturnType<typeof normalizeCriteria>,
): boolean {
  if (criteria.thickness && dimensions.thickness !== criteria.thickness) {
    return false;
  }
  if (criteria.width && dimensions.width !== criteria.width) {
    return false;
  }
  if (criteria.length && dimensions.length !== criteria.length) {
    return false;
  }

  return true;
}

export function hasDimensionalSourceSelection(
  filters: QualityDimensionalFilters,
): boolean {
  return filters.matchSpecified || filters.matchFound;
}

export function hasDimensionalSearchCriteria(
  filters: QualityDimensionalFilters,
): boolean {
  const criteria = normalizeCriteria(filters);
  return (
    hasDimensionalSourceSelection(filters) &&
    Boolean(criteria.thickness || criteria.width || criteria.length)
  );
}

export function hasActiveQualityDimensionalFilters(
  filters: QualityDimensionalFilters,
): boolean {
  return (
    hasDimensionalSearchCriteria(filters) ||
    filters.matchSpecified !== EMPTY_QUALITY_DIMENSIONAL_FILTERS.matchSpecified ||
    filters.matchFound !== EMPTY_QUALITY_DIMENSIONAL_FILTERS.matchFound
  );
}

export function toggleQualityDimensionalSource(
  filters: QualityDimensionalFilters,
  source: QualityDimensionalSource,
): QualityDimensionalFilters {
  if (source === 'specified') {
    const nextSpecified = !filters.matchSpecified;
    return {
      ...filters,
      matchSpecified: nextSpecified,
      matchFound: nextSpecified || filters.matchFound ? filters.matchFound : true,
    };
  }

  const nextFound = !filters.matchFound;
  return {
    ...filters,
    matchFound: nextFound,
    matchSpecified: nextFound || filters.matchSpecified ? filters.matchSpecified : true,
  };
}

export function isQualityDimensionalSourceSelected(
  filters: QualityDimensionalFilters,
  source: QualityDimensionalSource,
): boolean {
  return source === 'specified' ? filters.matchSpecified : filters.matchFound;
}

export function searchQualityDimensionalMatches(
  requests: CertificateRequest[],
  filters: QualityDimensionalFilters,
): QualityDimensionalSearchMatch[] {
  if (!hasDimensionalSearchCriteria(filters)) {
    return [];
  }

  const criteria = normalizeCriteria(filters);
  const matches: QualityDimensionalSearchMatch[] = [];

  for (const request of requests) {
    for (const attachment of request.attachments ?? []) {
      if (
        attachment.type !== 'IMPRESSAO_CONFERENCIA' ||
        !attachment.inspection ||
        attachment.lotIndex == null
      ) {
        continue;
      }

      const inspection = attachment.inspection;
      const specified = getDimensionsForSource(inspection, 'specified');
      const found = getDimensionsForSource(inspection, 'found');

      if (
        filters.matchSpecified &&
        !dimensionsMatchCriteria(specified, criteria)
      ) {
        continue;
      }
      if (filters.matchFound && !dimensionsMatchCriteria(found, criteria)) {
        continue;
      }

      matches.push({
        requestId: request.id,
        attachmentId: attachment.id,
        invoiceNumber: request.invoiceNumber,
        supplierName: request.supplier.name,
        lotIndex: attachment.lotIndex,
        lotLabel: attachment.lotLabel ?? `Lote ${attachment.lotIndex}`,
        specified,
        found,
        inspectedAt: inspection.inspectedAt,
      });
    }
  }

  return matches.sort((a, b) => {
    const byDate = b.inspectedAt.localeCompare(a.inspectedAt);
    if (byDate !== 0) {
      return byDate;
    }

    return a.invoiceNumber.localeCompare(b.invoiceNumber, 'pt-BR');
  });
}

function formatSourceSummary(filters: QualityDimensionalFilters): string {
  if (filters.matchSpecified && filters.matchFound) {
    return 'NF e recebimento';
  }
  if (filters.matchFound) {
    return 'recebimento';
  }
  return 'especificado NF';
}

export function buildQualityDimensionalFiltersSummary(
  filters: QualityDimensionalFilters,
  matchCount: number,
): string {
  const parts: string[] = [];
  const criteria = normalizeCriteria(filters);

  if (criteria.thickness) {
    parts.push(`esp. ${criteria.thickness}`);
  }
  if (criteria.width) {
    parts.push(`larg. ${criteria.width}`);
  }
  if (criteria.length) {
    parts.push(`comp. ${criteria.length}`);
  }

  const countLabel = `${matchCount} resultado${matchCount === 1 ? '' : 's'}`;

  if (parts.length === 0) {
    return 'Informe ao menos espessura, largura ou comprimento';
  }

  return `${countLabel} · ${formatSourceSummary(filters)} · ${parts.join(' · ')}`;
}
