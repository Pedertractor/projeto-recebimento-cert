export type GridConfig = {
  id: number;
  version: number;
  columns: number;
  rows: number;
  createdAt: string;
  updatedAt: string;
};

export type UpsertGridConfigInput = {
  columns: number;
  rows: number;
};
