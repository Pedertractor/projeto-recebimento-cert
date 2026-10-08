export type ViewKind = 'FRONT' | 'TOP' | 'BOTTOM' | 'RIGHT' | 'LEFT' | 'REAR';

export const VIEW_KINDS: ViewKind[] = [
  'FRONT',
  'TOP',
  'BOTTOM',
  'RIGHT',
  'LEFT',
  'REAR',
];

export const VIEW_KIND_LABELS: Record<ViewKind, string> = {
  FRONT: 'Frontal',
  TOP: 'Superior',
  BOTTOM: 'Inferior',
  RIGHT: 'Lateral direita',
  LEFT: 'Lateral esquerda',
  REAR: 'Posterior',
};

export type ExternalPartImage = {
  id: number;
  partId: number;
  path: string;
  name: string | null;
  ripSelected: boolean;
  isDeletable: boolean;
};

export type ExternalPart = {
  id: number;
  partCode: string;
  partNumber: string;
  description: string | null;
  group: string;
  client: string | null;
  serverPath: string | null;
  localPath: string | null;
  review: string | null;
  reviewChanged: boolean;
  status: boolean;
  images: ExternalPartImage[];
  createdAt: string;
  updatedAt: string;
};

export type PartView = {
  id: number;
  partId: number;
  kind: ViewKind;
  version: number;
  imagePath: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Part = {
  id: number;
  basePartId: number | null;
  partCode: string;
  partNumber: string;
  description: string | null;
  client: string | null;
  createdAt: string;
  updatedAt: string;
  views: PartView[];
};

export type PartListItem = {
  id: number;
  basePartId: number | null;
  partCode: string;
  partNumber: string;
  description: string | null;
  client: string | null;
  createdAt: string;
  updatedAt: string;
  viewsCount: number;
};

export type PartViewAttachment = {
  kind: ViewKind;
  file: File | null;
  previewUrl: string | null;
  externalPath: string | null;
  uploading: boolean;
};

export function buildExternalImageUrl(
  _part: ExternalPart,
  imagePath: string,
): string {
  const trimmed = imagePath.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (/^(https?:|data:)/i.test(trimmed)) {
    return trimmed;
  }

  return trimmed.replace(/\\/g, '/');
}

export function mapExternalImagesToViews(
  part: ExternalPart,
): Record<ViewKind, string | null> {
  const mapped = {} as Record<ViewKind, string | null>;

  for (const kind of VIEW_KINDS) {
    mapped[kind] = null;
  }

  part.images.forEach((image, index) => {
    const kind = VIEW_KINDS[index];
    if (!kind) {
      return;
    }

    mapped[kind] = buildExternalImageUrl(part, image.path);
  });

  return mapped;
}

export { resolveUploadUrl as resolvePartImageUrl } from '@/lib/resolve-upload-url';
