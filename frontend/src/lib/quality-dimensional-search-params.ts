import {
  EMPTY_QUALITY_DIMENSIONAL_FILTERS,
  type QualityDimensionalFilters,
} from '@/lib/quality-dimensional-filters';

const PARAM_SOURCE = 'origem';
const PARAM_THICKNESS = 'esp';
const PARAM_WIDTH = 'larg';
const PARAM_LENGTH = 'comp';

function encodeSources(filters: QualityDimensionalFilters): string | null {
  const { matchSpecified, matchFound } = filters;

  if (matchSpecified && matchFound) {
    return 'nf,rec';
  }
  if (matchFound) {
    return 'rec';
  }
  if (matchSpecified) {
    return 'nf';
  }

  return null;
}

function decodeSources(value: string | null): Pick<
  QualityDimensionalFilters,
  'matchSpecified' | 'matchFound'
> {
  if (!value) {
    return {
      matchSpecified: true,
      matchFound: false,
    };
  }

  if (value === 'found' || value === 'rec') {
    return { matchSpecified: false, matchFound: true };
  }

  if (value === 'nf') {
    return { matchSpecified: true, matchFound: false };
  }

  const tokens = value.split(',').map((part) => part.trim());
  const matchSpecified = tokens.includes('nf') || tokens.includes('specified');
  const matchFound = tokens.includes('rec') || tokens.includes('found');

  if (!matchSpecified && !matchFound) {
    return { matchSpecified: true, matchFound: false };
  }

  return { matchSpecified, matchFound };
}

export function filtersFromSearchParams(
  params: URLSearchParams,
): QualityDimensionalFilters {
  const sources = decodeSources(params.get(PARAM_SOURCE));

  return {
    ...sources,
    thickness: params.get(PARAM_THICKNESS) ?? '',
    width: params.get(PARAM_WIDTH) ?? '',
    length: params.get(PARAM_LENGTH) ?? '',
  };
}

export function filtersToSearchParams(
  filters: QualityDimensionalFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  const sourceValue = encodeSources(filters);
  if (sourceValue && sourceValue !== 'nf') {
    params.set(PARAM_SOURCE, sourceValue);
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
    params.has(PARAM_SOURCE)
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
