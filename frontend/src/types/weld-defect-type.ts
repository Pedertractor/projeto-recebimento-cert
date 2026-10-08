export type WeldDefectTypeImage = {
  id: number;
  path: string;
  name: string | null;
  createdAt: string;
};

export type WeldDefectType = {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  images: WeldDefectTypeImage[];
};

export type CreateWeldDefectTypeInput = {
  code: string;
  name: string;
  images: File[];
};

export type UpdateWeldDefectTypeInput = {
  id: number;
  code: string;
  name: string;
  newImages: File[];
  removeImageIds: number[];
};

export { resolveUploadUrl as resolveWeldDefectTypeImageUrl } from '@/lib/resolve-upload-url';
