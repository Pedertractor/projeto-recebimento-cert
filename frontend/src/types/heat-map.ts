import type { ViewKind } from '@/types/part';
import type { HeatMapPeriodPreset } from '@/lib/date-range-presets';

export type HeatMapRestoreState = {
  selectedPartId: number;
  selectedFace: ViewKind | null;
  selectedFaceVersion: number | null;
  dateFrom: string;
  dateTo: string;
  datePreset: HeatMapPeriodPreset | null;
  search: string;
};

export type OfProcessesNavigationState = {
  heatMapRestore?: HeatMapRestoreState;
};

export type HeatMapPartSummary = {
  partId: number;
  partCode: string;
  partNumber: string;
  client: string | null;
  testCount: number;
  findingCount: number;
  lastTestAt: string;
  firstFaceImagePath: string | null;
  testIds: number[];
};

export type HeatMapOccurrence = {
  testId: number;
  ofNumber: string | null;
  operatorName: string;
  occurredAt: string;
  defects: { id: number; code: string; name: string }[];
};

export type HeatMapCell = {
  coordinate: string;
  count: number;
  occurrences: HeatMapOccurrence[];
};

export type HeatMapDefectRanking = {
  id: number;
  code: string;
  name: string;
  count: number;
  percentage: number;
};

/** Variante de uma face: combina versão da imagem (PartView) e tamanho da malha. */
export type HeatMapFaceVariant = {
  variantKey: string;
  /** Versão sequencial dentro da face (1, 2, 3…), não a versão global da malha. */
  version: number;
  partViewId: number;
  kind: ViewKind;
  imageVersion: number;
  imagePath: string | null;
  columns: number;
  rows: number;
  testCount: number;
  findingCount: number;
  firstSeenAt: string;
  lastUsedAt: string;
};

export type HeatMapAnalysis = {
  availableFaces: ViewKind[];
  variantsByFace: Record<ViewKind, HeatMapFaceVariant[]>;
  cellsByVariantKey: Record<string, Record<string, HeatMapCell>>;
  defectRankingByVariantKey: Record<string, HeatMapDefectRanking[]>;
  totalFindings: number;
  affectedCells: number;
};
