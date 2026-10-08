import {
  certificateRequestStatusLabel,
  getNfConferenceStatus,
  type NfConferenceStatus,
} from '@/lib/certificate-request-labels';
import type { CertificateRequest } from '@/types/certificate-request';

export type NfConferenceStatusFilter = 'ALL' | NfConferenceStatus;

export const NF_CONFERENCE_STATUS_FILTER_OPTIONS: Array<{
  value: NfConferenceStatusFilter;
  label: string;
}> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'EM_CONFERENCIA', label: 'Em conferência' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

export function filterNfConferenceRequests(
  requests: CertificateRequest[],
  search: string,
  statusFilter: NfConferenceStatusFilter,
): CertificateRequest[] {
  const query = search.trim().toLowerCase();

  return requests.filter((request) => {
    const status = getNfConferenceStatus(request);
    if (statusFilter !== 'ALL' && status !== statusFilter) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      request.invoiceNumber,
      request.supplier.name,
      request.supplier.cnpj,
      String(request.id),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function hasActiveNfConferenceFilters(
  search: string,
  statusFilter: NfConferenceStatusFilter,
): boolean {
  return search.trim().length > 0 || statusFilter !== 'ALL';
}

export function buildNfConferenceFiltersSummary(
  search: string,
  statusFilter: NfConferenceStatusFilter,
  visibleCount: number,
  totalCount: number,
): string {
  const parts: string[] = [];

  if (search.trim()) {
    parts.push(`busca “${search.trim()}”`);
  }

  if (statusFilter !== 'ALL') {
    parts.push(certificateRequestStatusLabel(statusFilter));
  }

  const countLabel =
    visibleCount === totalCount
      ? `${totalCount} NF${totalCount === 1 ? '' : 's'}`
      : `${visibleCount} de ${totalCount}`;

  if (parts.length === 0) {
    return countLabel;
  }

  return `${parts.join(' · ')} — ${countLabel}`;
}
