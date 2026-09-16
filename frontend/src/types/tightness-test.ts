import type { ViewKind } from '@/types/part';

export type TightnessTestAreaInput = {
  viewKind: string;
  color: string;
  coordinates: string[];
  weldDefectTypeIds: number[];
};

export type CreateTightnessTestInput = {
  partId: number;
  ofNumber: string;
  serialNumber?: number | null;
  gridColumns: number;
  gridRows: number;
  gridVersion: number;
  areas: TightnessTestAreaInput[];
};

export type TightnessTest = {
  id: number;
  partId: number;
  operatorId: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  gridColumns: number;
  gridRows: number;
  gridVersion: number;
  startedAt: string;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  leaksCount: number;
};

export type TightnessTestListItem = {
  id: number;
  partId: number;
  ofNumber: string | null;
  serialNumber: number | null;
  partCode: string;
  partNumber: string;
  client: string | null;
  operatorName: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  leaksCount: number;
  startedAt: string;
  finishedAt: string | null;
  firstFaceImagePath: string | null;
  views: {
    id: number;
    kind: ViewKind;
    version: number;
    imagePath: string | null;
  }[];
};

export type TightnessTestDetailDefectType = {
  id: number;
  code: string;
  name: string;
};

export type TightnessTestDetailArea = {
  id: number;
  partViewId: number;
  viewKind: ViewKind;
  viewVersion: number;
  color: string;
  coordinates: string[];
  defectTypes: TightnessTestDetailDefectType[];
  notes: string | null;
};

export type TightnessTestDetail = {
  id: number;
  ofNumber: string | null;
  serialNumber: number | null;
  status: 'IN_PROGRESS' | 'COMPLETED';
  gridColumns: number;
  gridRows: number;
  gridVersion: number;
  startedAt: string;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  part: {
    id: number;
    partCode: string;
    partNumber: string;
    description: string | null;
    client: string | null;
    views: {
      id: number;
      kind: ViewKind;
      version: number;
      imagePath: string | null;
    }[];
  };
  operator: {
    id: number;
    name: string;
    cardNumber: string;
  };
  areas: TightnessTestDetailArea[];
};

export const TIGHTNESS_TEST_STATUS_LABELS: Record<
  TightnessTest['status'],
  string
> = {
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
};

export type LeakAreaMark = {
  clientId: string;
  color: string;
  coordinates: string[];
  defectTypeIds: number[];
  defectTypeNames: string[];
};
