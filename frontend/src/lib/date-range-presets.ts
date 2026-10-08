import {
  applyDatePreset,
  formatDateInputValue,
} from '@/lib/tightness-test-filters';

export type DateRangePreset =
  | 'last7Days'
  | 'last30Days'
  | 'last90Days'
  | 'thisMonth';

export type PeriodPreset = DateRangePreset | 'none';

export type HeatMapPeriodPreset = PeriodPreset;

export const DEFAULT_DATE_RANGE_PRESET: DateRangePreset = 'last30Days';

export function applyDateRangePreset(
  preset: DateRangePreset,
): { dateFrom: string; dateTo: string } {
  if (preset === 'last90Days') {
    const today = new Date();
    const fromDate = new Date(today);
    fromDate.setDate(fromDate.getDate() - 89);
    return {
      dateFrom: formatDateInputValue(fromDate),
      dateTo: formatDateInputValue(today),
    };
  }

  if (
    preset === 'last7Days' ||
    preset === 'last30Days' ||
    preset === 'thisMonth'
  ) {
    const range = applyDatePreset(preset);
    return {
      dateFrom: range.filterDateFrom,
      dateTo: range.filterDateTo,
    };
  }

  return applyDateRangePreset(DEFAULT_DATE_RANGE_PRESET);
}

export function applyPeriodPreset(
  preset: PeriodPreset,
): { dateFrom: string; dateTo: string } {
  if (preset === 'none') {
    return { dateFrom: '', dateTo: '' };
  }

  return applyDateRangePreset(preset);
}

export const applyHeatMapPeriodPreset = applyPeriodPreset;
