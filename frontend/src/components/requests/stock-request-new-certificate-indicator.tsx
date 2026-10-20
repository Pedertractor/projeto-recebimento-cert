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
        'pointer-events-none absolute top-0 right-0 z-10 grid size-[5.25rem] place-items-center rounded-bl-2xl rounded-tr-2xl border border-violet-400/40 bg-violet-600 text-white shadow-lg',
        className,
      )}
      title="Certificado anexado pelo compras ainda não visualizado pela equipe de estoque"
      aria-label="Novo certificado"
    >
      <p className="flex items-start gap-1 px-1 text-left">
        <FileBadge
          className="mt-0.5 size-3.5 shrink-0"
          strokeWidth={2.25}
          aria-hidden
        />
        <span className="text-[9px] font-bold leading-tight">Novo certificado</span>
      </p>
    </div>
  );
}
