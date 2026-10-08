import type { TightnessTestListItem } from '@/types/tightness-test';

export type TightnessTestStatusFilter = 'ALL' | 'IN_PROGRESS' | 'COMPLETED';

export type TightnessTestsFilterState = {
  filterOf: string;
  filterSearch: string;
  filterStatus: TightnessTestStatusFilter;
  filterDateFrom: string;
  filterDateTo: string;
};

export function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTestReferenceDate(test: TightnessTestListItem): Date {
  return new Date(test.finishedAt ?? test.startedAt);
}

export function isDateRangeInvalid(dateFrom: string, dateTo: string): boolean {
  if (!dateFrom || !dateTo) {
    return false;
  }

  return dateFrom > dateTo;
}

function matchesText(value: string | null | undefined, term: string): boolean {
  if (!term) {
    return true;
  }

  return (value ?? '').toLowerCase().includes(term);
}

function matchesDateRange(
  test: TightnessTestListItem,
  dateFrom: string,
  dateTo: string,
): boolean {
  if (!dateFrom && !dateTo) {
    return true;
  }

  if (isDateRangeInvalid(dateFrom, dateTo)) {
    return false;
  }

  const referenceDate = getTestReferenceDate(test);

  if (dateFrom) {
    const start = new Date(`${dateFrom}T00:00:00`);
    if (referenceDate < start) {
      return false;
    }
  }

  if (dateTo) {
    const end = new Date(`${dateTo}T23:59:59.999`);
    if (referenceDate > end) {
      return false;
    }
  }

  return true;
}

export function filterTightnessTests(
  tests: TightnessTestListItem[],
  filters: TightnessTestsFilterState,
): TightnessTestListItem[] {
  const ofTerm = filters.filterOf.trim().toLowerCase();
  const searchTerm = filters.filterSearch.trim().toLowerCase();

  return tests.filter((test) => {
    const matchesOf = matchesText(test.ofNumber, ofTerm);
    const matchesSearch =
      !searchTerm ||
      [test.client, test.partCode, test.partNumber, test.operatorName].some(
        (value) => (value ?? '').toLowerCase().includes(searchTerm),
      ) ||
      (test.serialNumber != null &&
        String(test.serialNumber).includes(searchTerm));
    const matchesStatus =
      filters.filterStatus === 'ALL' || test.status === filters.filterStatus;
    const matchesDate = matchesDateRange(
      test,
      filters.filterDateFrom,
      filters.filterDateTo,
    );

    return (
      matchesOf &&
      matchesSearch &&
      matchesStatus &&
      matchesDate
    );
  });
}

export function countActiveTightnessTestFilters(
  filters: TightnessTestsFilterState,
): number {
  return [
    filters.filterOf.trim(),
    filters.filterSearch.trim(),
    filters.filterStatus !== 'ALL' ? filters.filterStatus : '',
    filters.filterDateFrom || filters.filterDateTo ? 'date-range' : '',
  ].filter(Boolean).length;
}

export function applyDatePreset(
  preset: 'today' | 'last7Days' | 'last30Days' | 'thisMonth',
): Pick<TightnessTestsFilterState, 'filterDateFrom' | 'filterDateTo'> {
  const today = new Date();
  const to = formatDateInputValue(today);

  if (preset === 'today') {
    return { filterDateFrom: to, filterDateTo: to };
  }

  if (preset === 'last7Days') {
    const fromDate = new Date(today);
    fromDate.setDate(fromDate.getDate() - 6);
    return {
      filterDateFrom: formatDateInputValue(fromDate),
      filterDateTo: to,
    };
  }

  if (preset === 'last30Days') {
    const fromDate = new Date(today);
    fromDate.setDate(fromDate.getDate() - 29);
    return {
      filterDateFrom: formatDateInputValue(fromDate),
      filterDateTo: to,
    };
  }

  const fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    filterDateFrom: formatDateInputValue(fromDate),
    filterDateTo: to,
  };
}
