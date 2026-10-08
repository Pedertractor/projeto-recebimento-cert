import z from 'zod';

function parseIdList(value: string | undefined): number[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
}

const UNASSIGNED_CLIENT_FILTER = '__unassigned__';

function parseClientList(value: string | undefined): Array<string | null> {
  if (!value?.trim()) {
    return [];
  }

  return value.split(',').map((item) => {
    const trimmed = item.trim();
    if (trimmed === UNASSIGNED_CLIENT_FILTER) {
      return null;
    }

    return trimmed;
  });
}

export const analyticsOverviewQuerySchema = z.object({
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inicial inválida.')
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data final inválida.')
    .optional(),
  partIds: z.string().optional(),
  defectTypeIds: z.string().optional(),
  clients: z.string().optional(),
});

export type AnalyticsOverviewQueryRaw = z.infer<
  typeof analyticsOverviewQuerySchema
>;

export type AnalyticsOverviewQuery = {
  dateFrom?: string;
  dateTo?: string;
  partIds: number[];
  defectTypeIds: number[];
  clients: Array<string | null>;
};

export function parseAnalyticsOverviewQuery(
  query: AnalyticsOverviewQueryRaw,
): AnalyticsOverviewQuery {
  return {
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    partIds: parseIdList(query.partIds),
    defectTypeIds: parseIdList(query.defectTypeIds),
    clients: parseClientList(query.clients),
  };
}

export const analyticsDailyActivitySchema = z.object({
  date: z.string(),
  testCount: z.number(),
  leakCount: z.number(),
});

export const analyticsPartRankingSchema = z.object({
  partId: z.number(),
  partCode: z.string(),
  partNumber: z.string(),
  client: z.string().nullable(),
  testCount: z.number(),
  leakCount: z.number(),
  lastTestAt: z.string().nullable(),
  firstFaceImagePath: z.string().nullable(),
});

export const analyticsDefectRankingSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  count: z.number(),
  percentage: z.number(),
});

export const analyticsViewKindRankingSchema = z.object({
  kind: z.enum(['FRONT', 'TOP', 'BOTTOM', 'RIGHT', 'LEFT', 'REAR']),
  leakCount: z.number(),
  testCount: z.number(),
  percentage: z.number(),
});

export const analyticsHeatmapCellSchema = z.object({
  date: z.string().nullable(),
  leakCount: z.number(),
  level: z.number(),
  inRange: z.boolean(),
});

export const analyticsHeatmapWeekSchema = z.object({
  weekStart: z.string(),
  label: z.string(),
  cells: z.array(analyticsHeatmapCellSchema),
});

export const analyticsOverviewResponseSchema = z.object({
  filters: z.object({
    dateFrom: z.string(),
    dateTo: z.string(),
    partIds: z.array(z.number()),
    defectTypeIds: z.array(z.number()),
    clients: z.array(z.string().nullable()),
  }),
  summary: z.object({
    testCount: z.number(),
    leakCount: z.number(),
    affectedPartCount: z.number(),
    topDefectName: z.string().nullable(),
  }),
  dailyActivity: z.array(analyticsDailyActivitySchema),
  heatmapWeeks: z.array(analyticsHeatmapWeekSchema),
  partsRanking: z.array(analyticsPartRankingSchema),
  defectTypeRanking: z.array(analyticsDefectRankingSchema),
  viewKindRanking: z.array(analyticsViewKindRankingSchema),
});

export type AnalyticsOverviewResponse = z.infer<
  typeof analyticsOverviewResponseSchema
>;
