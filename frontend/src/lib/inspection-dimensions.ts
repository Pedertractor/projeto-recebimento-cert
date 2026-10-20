export function usesChapaDimensionalMask(
  productTypeCode: string | undefined,
): boolean {
  return productTypeCode?.trim().toUpperCase() === 'CHAPA';
}

export function joinDimensionalParts(
  thickness: string,
  width: string,
  length: string,
): string {
  const parts = [thickness, width, length]
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.join('X');
}

export function splitDimensionalCombined(value: string): {
  thickness: string;
  width: string;
  length: string;
} {
  const trimmed = value.trim();
  if (!trimmed) {
    return { thickness: '', width: '', length: '' };
  }

  if (/[Xx]/.test(trimmed)) {
    const parts = trimmed.split(/[Xx]/).map((part) => part.trim());
    return {
      thickness: parts[0] ?? '',
      width: parts[1] ?? '',
      length: parts[2] ?? '',
    };
  }

  return { thickness: trimmed, width: '', length: '' };
}
