import { useRef, type ChangeEvent, type ReactNode } from 'react';
import { FileUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type DocumentUploadFieldProps = {
  id: string;
  label: string;
  accept?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  placeholder?: string;
  hint?: string;
  buttonLabel?: string;
  error?: string;
  className?: string;
  icon?: ReactNode;
};

export function DocumentUploadField({
  id,
  label,
  accept = '.pdf,.png,.jpg,.jpeg,.webp',
  value,
  onChange,
  placeholder = 'Selecione um arquivo',
  hint = 'PDF ou imagem, até 10 MB',
  buttonLabel = 'Escolher arquivo',
  error,
  className,
  icon,
}: DocumentUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0] ?? null;
    onChange(file);
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      <div
        className={cn(
          'flex flex-col gap-4 rounded-2xl border border-dashed p-4 transition-colors sm:flex-row sm:items-center sm:justify-between',
          value
            ? 'border-brand/50 bg-brand/5'
            : 'border-brand/30 bg-brand-muted/20 hover:border-brand/45 hover:bg-brand-muted/30',
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm shadow-brand/15">
            {icon ?? <FileUp className="size-5" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {value?.name ?? placeholder}
            </p>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(null);
                if (inputRef.current) {
                  inputRef.current.value = '';
                }
              }}
            >
              Remover
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            {buttonLabel}
          </Button>
        </div>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
