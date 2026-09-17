import type { CertificateRequest } from '@/types/certificate-request';
import { formatRequestDate } from '@/lib/certificate-request-labels';
import { formatCnpjInput } from '@/utils/cnpj';

type CertificateRequestSummaryProps = {
  request: CertificateRequest;
  compact?: boolean;
};

export function CertificateRequestSummary({
  request,
  compact = false,
}: CertificateRequestSummaryProps) {
  const items = [
    { label: 'Solicitação', value: `#${request.id}` },
    { label: 'Fornecedor', value: request.supplier.name },
    {
      label: 'CNPJ',
      value: formatCnpjInput(request.supplier.cnpj),
    },
    { label: 'Nº NF', value: request.invoiceNumber },
    { label: 'Data NF', value: formatRequestDate(request.invoiceDate) },
    {
      label: 'Lotes na NF',
      value: String(request.expectedCertificates),
    },
    {
      label: 'Solicitante',
      value: request.createdByName ?? 'Operador de estoque',
    },
  ];

  if (!compact) {
    items.push({
      label: 'Abertura',
      value: formatRequestDate(request.submittedAt),
    });
  }

  if (request.notes) {
    items.push({ label: 'Observações', value: request.notes });
  }

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 space-y-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {item.label}
          </dt>
          <dd className="text-sm leading-snug wrap-break-word">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
