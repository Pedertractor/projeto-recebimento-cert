import type { CertificateRequestStatus } from '@/types/certificate-request';

export function certificateRequestStatusLabel(
  status: CertificateRequestStatus,
): string {
  switch (status) {
    case 'AGUARDANDO_COMPRAS':
      return 'Aguardando compras';
    case 'AGUARDANDO_FORNECEDOR':
      return 'Aguardando fornecedor';
    case 'CONCLUIDA':
      return 'Concluída';
    case 'CANCELADA':
      return 'Cancelada';
  }
}

export function certificateRequestStatusClassName(
  status: CertificateRequestStatus,
): string {
  switch (status) {
    case 'AGUARDANDO_COMPRAS':
      return 'bg-amber-100 text-amber-900 border-amber-200';
    case 'AGUARDANDO_FORNECEDOR':
      return 'bg-sky-100 text-sky-900 border-sky-200';
    case 'CONCLUIDA':
      return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    case 'CANCELADA':
      return 'bg-zinc-100 text-zinc-700 border-zinc-200';
  }
}

export function formatRequestDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-');
  if (!year || !month || !day) {
    return value;
  }
  return `${day}/${month}/${year}`;
}
