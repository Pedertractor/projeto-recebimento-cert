import { forwardRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

type HomeActionTileProps = {
  title: string;
  description?: string;
  badge?: number;
  to?: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
};

export const HomeActionTile = forwardRef<HTMLButtonElement, HomeActionTileProps>(
  function HomeActionTile(
    {
      title,
      description,
      badge,
      to,
      disabled = false,
      onClick,
      className,
      children,
    },
    ref,
  ) {
    const content = (
      <span
        className={cn(
          'relative z-10 flex flex-col items-start gap-1 text-left transition-colors duration-300',
          !disabled && 'group-hover:text-brand-foreground',
        )}
      >
        <span className="flex w-full items-center justify-between gap-2">
          <span className="text-base font-semibold leading-tight tracking-tight sm:text-lg">
            {title}
          </span>
          {typeof badge === 'number' && badge > 0 ? (
            <span className="rounded-full bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand transition-colors group-hover:bg-white/20 group-hover:text-brand-foreground">
              {badge}
            </span>
          ) : null}
        </span>
        {description ? (
          <span className="text-sm text-muted-foreground transition-colors group-hover:text-brand-foreground/80">
            {description}
          </span>
        ) : null}
        {children}
      </span>
    );

    const sweep = !disabled ? (
      <>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-brand via-brand-soft to-brand/90 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-2/3 -translate-x-full bg-linear-to-r from-brand-soft to-transparent opacity-0 blur-2xl transition-all duration-700 ease-out group-hover:translate-x-0 group-hover:opacity-70"
        />
      </>
    ) : null;

    const classes = cn(
      'group relative isolate flex min-h-24 w-full flex-col justify-center overflow-hidden rounded-2xl border-2 px-4 py-4 sm:min-h-28',
      disabled
        ? 'cursor-not-allowed border-brand/15 bg-brand-muted/40 text-muted-foreground opacity-70'
        : 'border-brand/20 bg-card text-brand shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-lg hover:shadow-brand/15',
      className,
    );

    if (disabled || !to) {
      return (
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          onClick={onClick}
          className={classes}
        >
          {sweep}
          {content}
        </button>
      );
    }

    return (
      <Link to={to} className={classes}>
        {sweep}
        {content}
      </Link>
    );
  },
);
