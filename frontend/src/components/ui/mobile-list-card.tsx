import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type MobileListCardProps = {
  onClick?: () => void;
  className?: string;
  children: ReactNode;
};

export function MobileListCard({
  onClick,
  className,
  children,
}: MobileListCardProps) {
  const interactive = Boolean(onClick);

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        'rounded-xl border border-border/70 bg-background p-4 shadow-xs transition-colors',
        interactive &&
          'cursor-pointer hover:bg-muted/40 active:bg-muted/60',
        className,
      )}
    >
      {children}
    </div>
  );
}

type MobileListCardRowProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function MobileListCardRow({
  label,
  value,
  className,
}: MobileListCardRowProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 text-sm',
        className,
      )}
    >
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right font-medium">{value}</span>
    </div>
  );
}
