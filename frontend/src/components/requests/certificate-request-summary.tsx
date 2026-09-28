import { SupplierLogo } from '@/components/suppliers/supplier-logo';
import type { CertificateRequest } from '@/types/certificate-request';
import { formatRequestDate } from '@/lib/certificate-request-labels';
import { formatCnpjInput } from '@/utils/cnpj';

type CertificateRequestSummaryProps = {
  request: CertificateRequest;
  compact?: boolean;
  showSupplierLogo?: boolean;
};

export function CertificateRequestSummary({
  request,
  compact = false,
  showSupplierLogo = false,
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

  const summaryItems =
    showSupplierLogo && !compact
      ? items.filter(
          (item) => item.label !== 'Fornecedor' && item.label !== 'CNPJ',
        )
      : items;

  const supplierBlock =
    showSupplierLogo && !compact ? (
      <div className="mb-4 flex items-start gap-4 border-b border-border/60 pb-4">
        <div className="size-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/70 sm:size-16">
          <SupplierLogo
            name={request.supplier.name}
            logoStoragePath={request.supplier.logoStoragePath}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Fornecedor
          </p>
          <p className="mt-1 text-base font-semibold leading-snug">
            {request.supplier.name}
          </p>
          <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
            {formatCnpjInput(request.supplier.cnpj)}
          </p>
        </div>
      </div>
    ) : null;

  if (compact) {
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

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {supplierBlock}
      <dl className="grid shrink-0 gap-3 sm:grid-cols-2">
        {summaryItems.map((item) => (
          <div key={item.label} className="min-w-0 space-y-1">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {item.label}
            </dt>
            <dd className="text-sm leading-snug wrap-break-word">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5">
        <p className="shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Observações
        </p>
        <div className="min-h-24 flex-1 overflow-auto rounded-xl bg-muted/30 p-3 text-sm leading-relaxed wrap-break-word ring-1 ring-border/50">
          {request.notes?.trim() ? (
            request.notes
          ) : (
            <span className="text-muted-foreground">Nenhuma observação informada.</span>
          )}
        </div>
      </div>
    </div>
  );
}
