import * as React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type DateRangePickerFieldProps = {
  id?: string;
  label?: string;
  dateFrom: string;
  dateTo: string;
  onChange: (range: { dateFrom: string; dateTo: string }) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  hideLabel?: boolean;
  invalid?: boolean;
};

function parseYmd(value: string): Date | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = parseISO(value.slice(0, 10));
  return isValid(parsed) ? parsed : undefined;
}

function formatRangeLabel(dateFrom: string, dateTo: string): string {
  const from = parseYmd(dateFrom);
  const to = parseYmd(dateTo);

  if (from && to) {
    return `${format(from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(to, 'dd/MM/yyyy', { locale: ptBR })}`;
  }

  if (from) {
    return `${format(from, 'dd/MM/yyyy', { locale: ptBR })} - ...`;
  }

  if (to) {
    return `... - ${format(to, 'dd/MM/yyyy', { locale: ptBR })}`;
  }

  return '';
}

export function DateRangePickerField({
  id,
  label,
  dateFrom,
  dateTo,
  onChange,
  placeholder = 'Selecionar período',
  className,
  compact = false,
  hideLabel = false,
  invalid = false,
}: DateRangePickerFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [monthCount, setMonthCount] = React.useState(1);

  React.useEffect(() => {
    const media = window.matchMedia('(min-width: 640px)');
    const sync = () => setMonthCount(media.matches ? 2 : 1);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const selectedRange = React.useMemo<DateRange | undefined>(() => {
    const from = parseYmd(dateFrom);
    const to = parseYmd(dateTo);

    if (!from && !to) {
      return undefined;
    }

    return { from, to };
  }, [dateFrom, dateTo]);

  const rangeLabel = formatRangeLabel(dateFrom, dateTo);

  return (
    <div
      className={cn(
        compact ? 'flex flex-col gap-1' : 'flex flex-col gap-1.5',
        className,
      )}
    >
      {!hideLabel && label ? (
        <Label className={cn(compact && 'text-xs')} htmlFor={id}>
          {label}
        </Label>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              compact
                ? 'h-9 min-h-9 min-w-0 px-2.5 text-xs sm:min-w-[11rem]'
                : 'h-9 min-w-0 px-3 text-sm sm:min-w-48',
              !rangeLabel && 'text-muted-foreground',
              invalid && 'border-destructive',
            )}
          >
            <CalendarIcon
              className={cn(
                'mr-2 shrink-0 opacity-70',
                compact ? 'size-3.5' : 'size-4',
              )}
            />
            <span className="truncate">
              {rangeLabel || placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(calc(100vw-2rem),20rem)] p-0 sm:w-auto"
          align="start"
        >
          <Calendar
            mode="range"
            numberOfMonths={monthCount}
            selected={selectedRange}
            defaultMonth={selectedRange?.from ?? selectedRange?.to ?? new Date()}
            onSelect={(range) => {
              onChange({
                dateFrom: range?.from
                  ? format(range.from, 'yyyy-MM-dd')
                  : '',
                dateTo: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
              });
            }}
          />
          {dateFrom || dateTo ? (
            <div className="flex justify-end border-t border-border/60 p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  onChange({ dateFrom: '', dateTo: '' });
                  setOpen(false);
                }}
              >
                Limpar período
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
}
