export const ALL_CLIENTS_VALUE = '__all__';
export const UNASSIGNED_CLIENT_VALUE = '__unassigned__';

export type ClientFilterOption = {
  value: string;
  label: string;
};

export function buildClientFilterOptions(
  parts: { client: string | null }[],
): ClientFilterOption[] {
  const clients = new Set<string>();
  let hasUnassigned = false;

  for (const part of parts) {
    const client = part.client?.trim();
    if (client) {
      clients.add(client);
    } else {
      hasUnassigned = true;
    }
  }

  const options: ClientFilterOption[] = [
    { value: ALL_CLIENTS_VALUE, label: 'Todos os clientes' },
  ];

  if (hasUnassigned) {
    options.push({
      value: UNASSIGNED_CLIENT_VALUE,
      label: 'Cliente não informado',
    });
  }

  for (const client of [...clients].sort((left, right) =>
    left.localeCompare(right, 'pt-BR'),
  )) {
    options.push({ value: client, label: client });
  }

  return options;
}

export function getClientFilterLabel(
  clientFilter: string,
  options: ClientFilterOption[],
): string | null {
  if (!clientFilter || clientFilter === ALL_CLIENTS_VALUE) {
    return null;
  }

  return options.find((option) => option.value === clientFilter)?.label ?? null;
}
