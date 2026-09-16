export function normalizeCnpj(value: string): string {
  return value.replace(/\D/g, '');
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

export function formatCnpj(value: string): string {
  const digits = normalizeCnpj(value);
  if (digits.length !== 14) {
    return value.trim();
  }

  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5',
  );
}
