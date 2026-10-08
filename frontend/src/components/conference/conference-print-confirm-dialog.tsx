import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ConferencePrintConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lotIndex: number;
  intent: 'remove' | 'replace';
  onConfirm: () => void;
  isPending?: boolean;
};

export function ConferencePrintConfirmDialog({
  open,
  onOpenChange,
  lotIndex,
  intent,
  onConfirm,
  isPending = false,
}: ConferencePrintConfirmDialogProps) {
  const isRemove = intent === 'remove';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-0 shadow-xl ring-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isRemove
              ? `Remover impressão do lote ${lotIndex}?`
              : `Alterar certificado do lote ${lotIndex}?`}
          </DialogTitle>
          <DialogDescription>
            {isRemove
              ? 'A imagem anexada será excluída. Será necessário colar ou anexar outra impressão para conferir este lote.'
              : 'A imagem atual será substituída. Os dados da conferência já salvos serão mantidos.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={isRemove ? 'destructive' : 'default'}
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isRemove ? 'Remover anexo' : 'Confirmar alteração'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
