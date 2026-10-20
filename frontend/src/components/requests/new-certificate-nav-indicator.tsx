import { FileBadge } from 'lucide-react';

import { cn } from '@/lib/utils';

export function NewCertificateNavIndicator({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md bg-orange-600 text-white shadow-sm ring-1 ring-orange-500/50',
        size === 'sm' ? 'size-7' : 'size-8',
        className,
      )}
      title="Novo certificado do compras"
      aria-label="Novo certificado do compras"
    >
      <FileBadge
        className={size === 'sm' ? 'size-3.5' : 'size-4'}
        strokeWidth={2.25}
        aria-hidden
      />
    </span>
  );
}
