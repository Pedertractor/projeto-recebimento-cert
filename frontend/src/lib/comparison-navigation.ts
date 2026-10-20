export type CertificateComparisonLocationState = {
  returnTo?: string;
};

export function getComparisonReturnTo(
  state: unknown,
): string | undefined {
  if (!state || typeof state !== 'object') {
    return undefined;
  }

  const returnTo = (state as CertificateComparisonLocationState).returnTo;
  if (typeof returnTo !== 'string' || !returnTo.startsWith('/')) {
    return undefined;
  }

  return returnTo;
}
