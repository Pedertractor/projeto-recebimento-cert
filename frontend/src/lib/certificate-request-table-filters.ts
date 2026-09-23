import { certificateRequestStatusLabel } from '@/lib/certificate-request-labels';
import type {
  CertificateRequest,
  CertificateRequestStatus,
} from '@/types/certificate-request';

export type RequestListStatusFilter = 'ALL' | CertificateRequestStatus;

export const STOCK_REQUEST_STATUS_FILTER_OPTIONS: Array<{
  value: RequestListStatusFilter;
  label: string;
}> = [
  { value: 'ALL', label: 'Todos' },
  {
    value: 'AGUARDANDO_COMPRAS',
    label: certificateRequestStatusLabel('AGUARDANDO_COMPRAS'),
  },
  {
    value: 'AGUARDANDO_FORNECEDOR',
    label: certificateRequestStatusLabel('AGUARDANDO_FORNECEDOR'),
  },
  {
    value: 'CONCLUIDA',
    label: certificateRequestStatusLabel('CONCLUIDA'),
  },
  {
    value: 'CANCELADA',
    label: certificateRequestStatusLabel('CANCELADA'),
  },
];

export const PURCHASE_REQUEST_STATUS_FILTER_OPTIONS: Array<{
  value: RequestListStatusFilter;
  label: string;
}> = [
  { value: 'ALL', label: 'Todos' },
  {
    value: 'AGUARDANDO_COMPRAS',
    label: certificateRequestStatusLabel('AGUARDANDO_COMPRAS'),
  },
  {
    value: 'AGUARDANDO_FORNECEDOR',
    label: certificateRequestStatusLabel('AGUARDANDO_FORNECEDOR'),
  },
  {
    value: 'CONCLUIDA',
    label: certificateRequestStatusLabel('CONCLUIDA'),
  },
];

function requestSearchHaystack(request: CertificateRequest): string {
  return [
    request.invoiceNumber,
    request.supplier.name,
    request.supplier.cnpj,
    String(request.id),
    request.createdByName ?? '',
  ]
    .join(' ')
    .toLowerCase();
}

export function filterCertificateRequestList(
  requests: CertificateRequest[],
  search: string,
  statusFilter: RequestListStatusFilter,
): CertificateRequest[] {
  const query = search.trim().toLowerCase();

  return requests.filter((request) => {
    if (statusFilter !== 'ALL' && request.status !== statusFilter) {
      return false;
    }

    if (!query) {
      return true;
    }

    return requestSearchHaystack(request).includes(query);
  });
}

export function hasActiveCertificateRequestListFilters(
  search: string,
  statusFilter: RequestListStatusFilter,
): boolean {
  return search.trim().length > 0 || statusFilter !== 'ALL';
}

export function buildCertificateRequestListFiltersSummary(
  search: string,
  statusFilter: RequestListStatusFilter,
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
      ? `${totalCount} solicitaç${totalCount === 1 ? 'ão' : 'ões'}`
      : `${visibleCount} de ${totalCount}`;

  if (parts.length === 0) {
    return countLabel;
  }

  return `${parts.join(' · ')} — ${countLabel}`;
}
