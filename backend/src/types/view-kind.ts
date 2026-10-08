export const VIEW_KINDS = [
  'FRONT',
  'TOP',
  'BOTTOM',
  'RIGHT',
  'LEFT',
  'REAR',
] as const;

export type ViewKindValue = (typeof VIEW_KINDS)[number];

export const ViewKind = {
  FRONT: 'FRONT',
  TOP: 'TOP',
  BOTTOM: 'BOTTOM',
  RIGHT: 'RIGHT',
  LEFT: 'LEFT',
  REAR: 'REAR',
} as const satisfies Record<string, ViewKindValue>;
