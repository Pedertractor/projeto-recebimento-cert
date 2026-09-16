import type { ViewKind } from '@/types/part';

export type AnalyticsDailyActivity = {
  date: string;
  testCount: number;
  leakCount: number;
};

export type AnalyticsHeatmapCell = {
  date: string | null;
  leakCount: number;
  level: number;
  inRange: boolean;
};

export type AnalyticsHeatmapWeek = {
  weekStart: string;
  label: string;
  cells: AnalyticsHeatmapCell[];
};

export type AnalyticsPartRanking = {
  partId: number;
  partCode: string;
  partNumber: string;
  client: string | null;
  testCount: number;
  leakCount: number;
  lastTestAt: string | null;
  firstFaceImagePath: string | null;
};

export type AnalyticsDefectRanking = {
  id: number;
  code: string;
  name: string;
  count: number;
  percentage: number;
};

export type AnalyticsViewKindRanking = {
  kind: ViewKind;
  leakCount: number;
  testCount: number;
  percentage: number;
};

export type AnalyticsOverview = {
  filters: {
    dateFrom: string;
    dateTo: string;
    partIds: number[];
    defectTypeIds: number[];
    clients: Array<string | null>;
  };
  summary: {
    testCount: number;
    leakCount: number;
    affectedPartCount: number;
    topDefectName: string | null;
  };
  dailyActivity: AnalyticsDailyActivity[];
  heatmapWeeks: AnalyticsHeatmapWeek[];
  partsRanking: AnalyticsPartRanking[];
  defectTypeRanking: AnalyticsDefectRanking[];
  viewKindRanking: AnalyticsViewKindRanking[];
};

export type AnalyticsOverviewFilters = {
  dateFrom: string;
  dateTo: string;
  partIds: number[];
  defectTypeIds: number[];
  clients: string[];
};
