import { Check, Moon, Palette, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { AdminTheme } from '@/lib/admin-theme';
import { cn } from '@/lib/utils';
import { useAdminTheme } from '@/providers/admin-theme-provider';

const PALETTE_OPTIONS: Array<{
  id: AdminTheme;
  label: string;
  description: string;
  swatches: string[];
}> = [
  {
    id: 'light',
    label: 'Claro',
    description: 'Fundo claro e contraste suave',
    swatches: ['#ffffff', '#c7ede8', '#1693a5', '#45b5c4'],
  },
  {
    id: 'dark',
    label: 'Escuro',
    description: 'Fundo preto e destaque brand',
    swatches: ['#0a0a0a', '#141414', '#45b5c4', '#1693a5'],
  },
];

export function AdminThemeToggle({ className }: { className?: string }) {
  const { theme, canToggleTheme, setTheme } = useAdminTheme();

  if (!canToggleTheme) {
    return null;
  }

  return (
    <div className={cn('flex shrink-0 items-center', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 rounded-full border-border bg-background shadow-sm hover:bg-accent"
            aria-label="Alterar paleta do tema"
          >
            {theme === 'dark' ? (
              <Moon className="size-4" aria-hidden />
            ) : (
              <Sun className="size-4" aria-hidden />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[min(100vw-2rem,16rem)] p-3">
          <div className="mb-3 flex items-center gap-2">
            <Palette className="size-4 text-brand" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-foreground">Paleta</p>
              <p className="text-xs text-muted-foreground">
                Escolha o tema da interface
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {PALETTE_OPTIONS.map((option) => {
              const selected = theme === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                    selected
                      ? 'border-brand bg-brand-muted/40 ring-2 ring-brand/20'
                      : 'border-border bg-card hover:bg-accent/50',
                  )}
                >
                  <div className="grid shrink-0 grid-cols-2 gap-1">
                    {option.swatches.map((color) => (
                      <span
                        key={`${option.id}-${color}`}
                        className="size-4 rounded-full border border-border/60"
                        style={{ backgroundColor: color }}
                        aria-hidden
                      />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {option.label}
                      </p>
                      {selected ? (
                        <Check
                          className="size-4 shrink-0 text-brand"
                          aria-hidden
                        />
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
