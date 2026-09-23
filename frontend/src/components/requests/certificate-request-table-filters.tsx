import { RotateCcw, Search } from 'lucide-react';

import { CollapsibleFilters } from '@/components/collapsible-filters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RequestListStatusFilter } from '@/lib/certificate-request-table-filters';
import { cn } from '@/lib/utils';

type StatusOption = {
  value: RequestListStatusFilter;
  label: string;
};

type CertificateRequestTableFiltersProps = {
  searchInputId: string;
  searchPlaceholder: string;
  search: string;
  statusFilter: RequestListStatusFilter;
  statusOptions: StatusOption[];
  filtersSummary: string;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: RequestListStatusFilter) => void;
  onReset: () => void;
};

export function CertificateRequestTableFilters({
  searchInputId,
  searchPlaceholder,
  search,
  statusFilter,
  statusOptions,
  filtersSummary,
  hasActiveFilters,
  onSearchChange,
  onStatusFilterChange,
  onReset,
}: CertificateRequestTableFiltersProps) {
  return (
    <CollapsibleFilters summary={filtersSummary}>
      <div className="flex w-full min-w-[min(100%,16rem)] flex-1 flex-col gap-1.5 sm:max-w-md">
        <Label htmlFor={searchInputId} className="text-sm font-medium">
          Buscar
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id={searchInputId}
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-9 bg-background pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Status</span>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const selected = statusFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onStatusFilterChange(option.value)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  selected
                    ? 'border-brand bg-brand text-brand-foreground shadow-sm'
                    : 'border-border bg-background text-muted-foreground hover:border-brand/30 hover:bg-muted/50 hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex w-full items-end justify-end sm:w-auto">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          disabled={!hasActiveFilters}
          onClick={onReset}
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Limpar filtros
        </Button>
      </div>
    </CollapsibleFilters>
  );
}
