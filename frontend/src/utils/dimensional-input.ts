/**
 * Formata entrada numérica no padrão brasileiro (vírgula decimal), com casas
 * fixas preenchidas da direita para a esquerda — ex.: 1250 + 2 casas → 12,50.
 */
export function formatFixedDecimalBrInput(
  value: string,
  fractionDigits: number,
): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }

  const padded =
    digits.length <= fractionDigits
      ? digits.padStart(fractionDigits + 1, '0')
      : digits;

  const intDigits = padded.slice(0, -fractionDigits);
  const fracDigits = padded.slice(-fractionDigits);
  const intPart = intDigits.replace(/^0+(?=\d)/, '') || '0';

  return `${intPart},${fracDigits}`;
}

/** Reaplica a máscara em valores já salvos (ex.: após migração ou edição). */
export function normalizeStoredDimensionalValue(
  value: string,
  fractionDigits: number,
): string {
  return formatFixedDecimalBrInput(value, fractionDigits);
}
