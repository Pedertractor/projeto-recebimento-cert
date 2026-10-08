import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { FileText, FileUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type DocumentUploadFieldProps = {
  id: string;
  label?: string;
  accept?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  selectedDescription?: string;
  error?: string;
  className?: string;
};

export function DocumentUploadField({
  id,
  label,
  accept = '.pdf,.png,.jpg,.jpeg,.webp',
  value,
  onChange,
  emptyTitle = 'Clique ou arraste o arquivo aqui',
  emptyDescription = 'Anexe a nota fiscal com certificados. PDF ou imagem, até 30 MB.',
  selectedDescription = 'Clique para trocar o arquivo · PDF ou imagem, até 30 MB',
  error,
  className,
}: DocumentUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function applyFile(file: File | undefined): void {
    onChange(file ?? null);
    if (!file && inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    applyFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>): void {
    event.preventDefault();
    setIsDragOver(false);
    applyFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
          isDragOver
            ? 'border-brand bg-brand-muted/40'
            : value
              ? 'border-brand/60 bg-brand-muted/20'
              : 'border-muted-foreground/35 bg-muted/20 hover:border-muted-foreground/55 hover:bg-muted/35',
        )}
      >
        <span
          className={cn(
            'flex size-14 items-center justify-center rounded-2xl',
            value
              ? 'bg-brand text-brand-foreground'
              : 'bg-background text-muted-foreground shadow-sm ring-1 ring-border',
          )}
        >
          {value ? <FileUp className="size-7" /> : <FileText className="size-7" />}
        </span>
        {value ? (
          <>
            <p className="max-w-full truncate text-sm font-semibold">
              {value.name}
            </p>
            <p className="text-xs text-muted-foreground">{selectedDescription}</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold">{emptyTitle}</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              {emptyDescription}
            </p>
          </>
        )}
      </button>
      {value ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => applyFile(undefined)}
          >
            Remover arquivo
          </Button>
        </div>
      ) : null}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
