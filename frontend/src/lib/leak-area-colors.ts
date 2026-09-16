export const LEAK_AREA_COLORS = [
  '#DC2626',
  '#EA580C',
  '#D97706',
  '#9333EA',
  '#2563EB',
  '#DB2777',
  '#B91C1C',
  '#7C3AED',
] as const;

export function getLeakAreaColor(index: number): string {
  return LEAK_AREA_COLORS[index % LEAK_AREA_COLORS.length];
}

export function withAlpha(hexColor: string, alpha: number): string {
  const normalized = hexColor.replace('#', '');
  if (normalized.length !== 6) {
    return hexColor;
  }

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
