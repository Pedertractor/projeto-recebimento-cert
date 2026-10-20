import { RotateCcw } from 'lucide-react';

import { FormattedDimensionalInput } from '@/components/conference/formatted-dimensional-input';
import { CollapsibleFilters } from '@/components/collapsible-filters';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  QUALITY_DIMENSIONAL_SOURCE_OPTIONS,
  type QualityDimensionalFilters,
  type QualityDimensionalSource,
} from '@/lib/quality-dimensional-filters';
import { cn } from '@/lib/utils';

type QualityDimensionalFiltersProps = {
  filters: QualityDimensionalFilters;
  filtersSummary: string;
  hasActiveFilters: boolean;
  onChange: (filters: QualityDimensionalFilters) => void;
  onReset: () => void;
};

export function QualityDimensionalFiltersPanel({
  filters,
  filtersSummary,
  hasActiveFilters,
  onChange,
  onReset,
}: QualityDimensionalFiltersProps) {
  function patch(partial: Partial<QualityDimensionalFilters>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <CollapsibleFilters summary={filtersSummary}>
      <div className="flex w-full flex-col gap-2">
        <span className="text-sm font-medium text-foreground">
          Comparar com
        </span>
        <div className="flex flex-wrap gap-2">
          {QUALITY_DIMENSIONAL_SOURCE_OPTIONS.map((option) => {
            const selected = filters.source === option.value;

            return (
              <button
                key={option.value}
                type="button"
                title={option.description}
                onClick={() =>
                  patch({ source: option.value as QualityDimensionalSource })
                }
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

      <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-3xl">
        <div className="space-y-1.5">
          <Label htmlFor="quality-dim-thickness">Espessura</Label>
          <FormattedDimensionalInput
            id="quality-dim-thickness"
            fractionDigits={2}
            placeholder="0,00"
            value={filters.thickness}
            onChange={(value) => patch({ thickness: value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quality-dim-width">Largura</Label>
          <FormattedDimensionalInput
            id="quality-dim-width"
            fractionDigits={3}
            placeholder="0,000"
            value={filters.width}
            onChange={(value) => patch({ width: value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quality-dim-length">Comprimento</Label>
          <FormattedDimensionalInput
            id="quality-dim-length"
            fractionDigits={3}
            placeholder="0,000"
            value={filters.length}
            onChange={(value) => patch({ length: value })}
          />
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
