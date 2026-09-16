export function normalizeCnpj(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCnpjInput(value: string): string {
  const digits = normalizeCnpj(value).slice(0, 14);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }

  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function isValidCnpj(value: string): boolean {
  return getCnpjValidationMessage(value) === null;
}

export function getCnpjValidationMessage(value: string): string | null {
  const digits = normalizeCnpj(value);

  if (!digits) {
    return 'Informe o CNPJ.';
  }

  if (digits.length !== 14) {
    return `CNPJ deve conter 14 dígitos (informados: ${digits.length}).`;
  }

  if (/^(\d)\1+$/.test(digits)) {
    return 'CNPJ inválido.';
  }

  const calcCheckDigit = (base: string, factors: number[]): number => {
    const sum = base
      .split('')
      .reduce((acc, digit, index) => acc + Number(digit) * factors[index]!, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstFactors = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondFactors = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const firstDigit = calcCheckDigit(digits.slice(0, 12), firstFactors);
  const secondDigit = calcCheckDigit(
    `${digits.slice(0, 12)}${firstDigit}`,
    secondFactors,
  );

  if (!digits.endsWith(`${firstDigit}${secondDigit}`)) {
    return 'CNPJ inválido. Verifique os dígitos informados.';
  }

  return null;
}
