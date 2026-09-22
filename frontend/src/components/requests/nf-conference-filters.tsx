import { RotateCcw, Search } from 'lucide-react';

import { CollapsibleFilters } from '@/components/collapsible-filters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  NF_CONFERENCE_STATUS_FILTER_OPTIONS,
  type NfConferenceStatusFilter,
} from '@/lib/nf-conference-filters';
import { cn } from '@/lib/utils';

type NfConferenceFiltersProps = {
  search: string;
  statusFilter: NfConferenceStatusFilter;
  filtersSummary: string;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: NfConferenceStatusFilter) => void;
  onReset: () => void;
};

export function NfConferenceFilters({
  search,
  statusFilter,
  filtersSummary,
  hasActiveFilters,
  onSearchChange,
  onStatusFilterChange,
  onReset,
}: NfConferenceFiltersProps) {
  return (
    <CollapsibleFilters summary={filtersSummary}>
      <div className="flex w-full min-w-[min(100%,16rem)] flex-1 flex-col gap-1.5 sm:max-w-md">
        <Label htmlFor="nf-conference-search" className="text-sm font-medium">
          Buscar
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="nf-conference-search"
            type="search"
            placeholder="NF, fornecedor, CNPJ ou nº da solicitação"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-9 bg-background pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Status</span>
        <div className="flex flex-wrap gap-2">
          {NF_CONFERENCE_STATUS_FILTER_OPTIONS.map((option) => {
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
