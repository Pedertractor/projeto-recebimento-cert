import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

type HoverDirection = 'left' | 'right';

type HomeActionTileProps = {
  title: string;
  to?: string;
  disabled?: boolean;
  hoverDirection?: HoverDirection;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
};

export function HomeActionTile({
  title,
  to,
  disabled = false,
  hoverDirection = 'left',
  onClick,
  className,
  children,
}: HomeActionTileProps) {
  const content = (
    <>
      <span className="text-lg font-semibold leading-tight tracking-tight sm:text-xl">
        {title}
      </span>
      {children}
    </>
  );

  const classes = cn(
    'group relative isolate flex min-h-28 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 px-4 py-6 text-center sm:min-h-36',
    disabled
      ? 'cursor-not-allowed border-brand/15 bg-brand-muted/40 text-muted-foreground opacity-70'
      : cn(
          'border-brand/20 bg-card text-brand shadow-sm',
          'transition-[transform,box-shadow,border-color] duration-300 ease-out',
          'hover:-translate-y-1 hover:border-brand/50 hover:shadow-lg hover:shadow-brand/15',
        ),
    className,
  );

  const sweep = !disabled ? (
    <>
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-all duration-500 ease-out group-hover:opacity-100',
          hoverDirection === 'left'
            ? 'translate-x-full bg-gradient-to-l from-brand via-brand-soft to-brand/90 group-hover:translate-x-0'
            : '-translate-x-full bg-gradient-to-r from-brand via-brand-soft to-brand/90 group-hover:translate-x-0',
        )}
      />
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 w-2/3 opacity-0 blur-2xl transition-all duration-700 ease-out group-hover:opacity-70',
          hoverDirection === 'left'
            ? 'left-0 -translate-x-full bg-gradient-to-l from-brand-soft to-transparent group-hover:translate-x-0'
            : 'right-0 translate-x-full bg-gradient-to-r from-brand-soft to-transparent group-hover:translate-x-0',
        )}
      />
    </>
  ) : null;

  const inner = (
    <>
      {sweep}
      <span
        className={cn(
          'relative z-10 flex flex-col items-center gap-1 transition-colors duration-300',
          !disabled && 'group-hover:text-brand-foreground',
        )}
      >
        {content}
      </span>
    </>
  );

  if (disabled || !to) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={classes}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link to={to} className={classes}>
      {inner}
    </Link>
  );
}
