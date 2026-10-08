import * as React from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Collapsible as CollapsiblePrimitive } from 'radix-ui';

import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type CollapsibleFiltersProps = {
  summary: string;
  children: React.ReactNode;
};

export function CollapsibleFilters({
  summary,
  children,
}: CollapsibleFiltersProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  return (
    <CollapsiblePrimitive.Root open={open} onOpenChange={setOpen}>
      <div className="overflow-hidden rounded-lg border bg-card">
        <CollapsiblePrimitive.Trigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
          >
            <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros</span>
            <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
              {summary}
            </span>
            <ChevronDown
              className={cn(
                'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                open && 'rotate-180',
              )}
            />
          </button>
        </CollapsiblePrimitive.Trigger>

        <CollapsiblePrimitive.Content className="overflow-hidden">
          <div className="flex flex-wrap items-end gap-3 border-t px-4 py-4">
            {children}
          </div>
        </CollapsiblePrimitive.Content>
      </div>
    </CollapsiblePrimitive.Root>
  );
}
