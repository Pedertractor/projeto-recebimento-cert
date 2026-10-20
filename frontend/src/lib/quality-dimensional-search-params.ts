import {
  EMPTY_QUALITY_DIMENSIONAL_FILTERS,
  type QualityDimensionalFilters,
  type QualityDimensionalSource,
} from '@/lib/quality-dimensional-filters';

const PARAM_SOURCE = 'origem';
const PARAM_THICKNESS = 'esp';
const PARAM_WIDTH = 'larg';
const PARAM_LENGTH = 'comp';

export function filtersFromSearchParams(
  params: URLSearchParams,
): QualityDimensionalFilters {
  const sourceParam = params.get(PARAM_SOURCE);
  const source: QualityDimensionalSource =
    sourceParam === 'found' ? 'found' : 'specified';

  return {
    source,
    thickness: params.get(PARAM_THICKNESS) ?? '',
    width: params.get(PARAM_WIDTH) ?? '',
    length: params.get(PARAM_LENGTH) ?? '',
  };
}

export function filtersToSearchParams(
  filters: QualityDimensionalFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.source === 'found') {
    params.set(PARAM_SOURCE, 'found');
  }

  const thickness = filters.thickness.trim();
  const width = filters.width.trim();
  const length = filters.length.trim();

  if (thickness) {
    params.set(PARAM_THICKNESS, thickness);
  }
  if (width) {
    params.set(PARAM_WIDTH, width);
  }
  if (length) {
    params.set(PARAM_LENGTH, length);
  }

  return params;
}

export function buildQualityDimensionalSearchPath(
  filters: QualityDimensionalFilters,
): string {
  const query = filtersToSearchParams(filters).toString();
  return query
    ? `/qualidade/busca-dimensionais?${query}`
    : '/qualidade/busca-dimensionais';
}

export function hasDimensionalSearchParams(params: URLSearchParams): boolean {
  return (
    params.has(PARAM_THICKNESS) ||
    params.has(PARAM_WIDTH) ||
    params.has(PARAM_LENGTH) ||
    params.get(PARAM_SOURCE) === 'found'
  );
}

export function mergeFiltersWithSearchParams(
  params: URLSearchParams,
): QualityDimensionalFilters {
  if (!hasDimensionalSearchParams(params)) {
    return EMPTY_QUALITY_DIMENSIONAL_FILTERS;
  }

  return filtersFromSearchParams(params);
}
