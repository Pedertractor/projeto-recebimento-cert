import { FileBadge } from 'lucide-react';

import { cn } from '@/lib/utils';

type StockRequestNewCertificateIndicatorProps = {
  className?: string;
};

export function StockRequestNewCertificateIndicator({
  className,
}: StockRequestNewCertificateIndicatorProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute top-0 right-0 z-10 flex max-w-[7.25rem] items-center gap-1 rounded-bl-lg rounded-tr-2xl border border-orange-400/50 bg-orange-600 px-1.5 py-0.5 text-white shadow-md',
        className,
      )}
      title="Certificado anexado pelo compras ainda não visualizado pela equipe de estoque"
      aria-label="Novo certificado"
    >
      <FileBadge className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
      <span className="text-[11px] font-bold leading-none">Novo certificado</span>
    </div>
  );
}
