import * as React from 'react';
import { format, isValid, parse, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type DatePickerFieldProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  allowTyping?: boolean;
  hideLabel?: boolean;
  min?: string;
  max?: string;
};

function parseYmd(value: string): Date | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = parseISO(value.slice(0, 10));
  return isValid(parsed) ? parsed : undefined;
}

function formatTypedDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function typedDateToYmd(value: string): string | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return null;
  }

  const parsed = parse(value, 'dd/MM/yyyy', new Date());
  if (!isValid(parsed) || format(parsed, 'dd/MM/yyyy') !== value) {
    return null;
  }

  return format(parsed, 'yyyy-MM-dd');
}

export function DatePickerField({
  id,
  label,
  value,
  onChange,
  placeholder = 'Selecionar data',
  className,
  compact = false,
  allowTyping = false,
  hideLabel = false,
  min,
  max,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);
  const selected = React.useMemo(() => parseYmd(value), [value]);
  const [typedValue, setTypedValue] = React.useState(() =>
    selected ? format(selected, 'dd/MM/yyyy') : '',
  );

  React.useEffect(() => {
    if (!isTyping) {
      setTypedValue(selected ? format(selected, 'dd/MM/yyyy') : '');
    }
  }, [isTyping, selected]);

  const calendar = (
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={selected}
        disabled={[
          ...(parseYmd(min ?? '') ? [{ before: parseYmd(min ?? '')! }] : []),
          ...(parseYmd(max ?? '') ? [{ after: parseYmd(max ?? '')! }] : []),
        ]}
        onSelect={(date) => {
          onChange(date ? format(date, 'yyyy-MM-dd') : '');
          setTypedValue(date ? format(date, 'dd/MM/yyyy') : '');
          setOpen(false);
        }}
        defaultMonth={selected ?? new Date()}
      />
    </PopoverContent>
  );

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
      {allowTyping ? (
        <div className="relative min-w-0">
          <Input
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={10}
            value={typedValue}
            placeholder="dd/mm/aaaa"
            className={cn(
              'w-full pr-10 font-normal tabular-nums',
              compact ? 'h-8 min-h-8 text-xs' : 'h-9',
            )}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
            onChange={(event) => {
              const formatted = formatTypedDate(event.target.value);
              setTypedValue(formatted);
              onChange(typedDateToYmd(formatted) ?? '');
            }}
          />
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
                aria-label="Abrir calendário"
                title="Selecionar no calendário"
              >
                <CalendarIcon className="size-4" />
              </Button>
            </PopoverTrigger>
            {calendar}
          </Popover>
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              type="button"
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                compact
                  ? 'h-8 min-h-8 min-w-32 px-2.5 text-xs'
                  : 'h-9 min-w-40 px-3',
                !selected && 'text-muted-foreground',
              )}
            >
              <CalendarIcon
                className={cn(
                  'mr-2 shrink-0 opacity-70',
                  compact ? 'size-3.5' : 'size-4',
                )}
              />
              {selected ? (
                format(selected, 'dd/MM/yyyy', { locale: ptBR })
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          {calendar}
        </Popover>
      )}
    </div>
  );
}
