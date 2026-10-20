import type {
  CertificateInspection,
  CertificateRequest,
} from '@/types/certificate-request';
import { normalizeStoredDimensionalValue } from '@/utils/dimensional-input';

export type QualityDimensionalSource = 'specified' | 'found';

export type QualityDimensionalFilters = {
  source: QualityDimensionalSource;
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
    description: 'Compara com o dimensional informado na nota fiscal.',
  },
  {
    value: 'found',
    label: 'Encontrado no recebimento',
    description: 'Compara com o dimensional medido na conferência.',
  },
];

export const EMPTY_QUALITY_DIMENSIONAL_FILTERS: QualityDimensionalFilters = {
  source: 'specified',
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
  thickness: string;
  width: string;
  length: string;
  dimensionsLabel: string;
  inspectedAt: string;
};

function getDimensionsForSource(
  inspection: CertificateInspection,
  source: QualityDimensionalSource,
) {
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

export function hasDimensionalSearchCriteria(
  filters: QualityDimensionalFilters,
): boolean {
  const criteria = normalizeCriteria(filters);
  return Boolean(criteria.thickness || criteria.width || criteria.length);
}

export function hasActiveQualityDimensionalFilters(
  filters: QualityDimensionalFilters,
): boolean {
  return hasDimensionalSearchCriteria(filters);
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
      const dimensions = getDimensionsForSource(inspection, filters.source);

      if (criteria.thickness && dimensions.thickness !== criteria.thickness) {
        continue;
      }
      if (criteria.width && dimensions.width !== criteria.width) {
        continue;
      }
      if (criteria.length && dimensions.length !== criteria.length) {
        continue;
      }

      matches.push({
        requestId: request.id,
        attachmentId: attachment.id,
        invoiceNumber: request.invoiceNumber,
        supplierName: request.supplier.name,
        lotIndex: attachment.lotIndex,
        lotLabel: attachment.lotLabel ?? `Lote ${attachment.lotIndex}`,
        thickness: dimensions.thickness,
        width: dimensions.width,
        length: dimensions.length,
        dimensionsLabel: [
          dimensions.thickness,
          dimensions.width,
          dimensions.length,
        ].join(' X '),
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

  const sourceLabel =
    filters.source === 'specified'
      ? 'especificado NF'
      : 'encontrado recebimento';

  const countLabel = `${matchCount} resultado${matchCount === 1 ? '' : 's'}`;

  if (parts.length === 0) {
    return 'Informe ao menos espessura, largura ou comprimento';
  }

  return `${countLabel} · ${sourceLabel} · ${parts.join(' · ')}`;
}
