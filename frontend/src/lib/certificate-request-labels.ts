import type { CertificateRequestStatus } from '@/types/certificate-request';

export function certificateRequestStatusLabel(
  status: CertificateRequestStatus,
): string {
  switch (status) {
    case 'CADASTRADA':
      return 'NF cadastrada';
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
    case 'CADASTRADA':
      return 'bg-brand-muted text-brand border-brand/20';
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

export function formatRequestDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function requestHistoryEventLabel(eventType: string): string {
  switch (eventType) {
    case 'SOLICITACAO_CRIADA':
      return 'NF cadastrada';
    case 'EMAIL_COMPRAS_ENVIADO':
      return 'E-mail enviado ao compras';
    case 'ENVIO_FORNECEDOR_REGISTRADO':
      return 'Envio ao fornecedor registrado';
    case 'CERTIFICADO_ANEXADO':
      return 'Certificado anexado';
    case 'CERTIFICADO_REMOVIDO':
      return 'Certificado removido';
    case 'SOLICITACAO_CONCLUIDA':
      return 'Solicitação concluída';
    case 'EMAIL_ESTOQUE_ENVIADO':
      return 'E-mail enviado ao estoque';
    case 'SOLICITACAO_CANCELADA':
      return 'Solicitação cancelada';
    case 'CONFERENCIA_REALIZADA':
      return 'Conferência realizada';
    case 'CERTIFICADO_INVALIDADO':
      return 'Certificado invalidado';
    default:
      return eventType;
  }
}
