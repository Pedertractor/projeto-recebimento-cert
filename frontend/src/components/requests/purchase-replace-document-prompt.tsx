import { useRef, useState, type ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { HttpClientError } from '@/lib/http-client';
import {
  certificateRequestDetailQueryKey,
  certificateRequestsListQueryKey,
  completedCertificateRequestsQueryKey,
  pendingPurchaseCertificateRequestsQueryKey,
  purchaseCertificateRequestsListQueryKey,
  replacePurchaseDocument,
} from '@/services/certificate-requests/certificate-request.service';

type PurchaseReplaceDocumentPromptProps = {
  requestId: number;
};

export function PurchaseReplaceDocumentPrompt({
  requestId,
}: PurchaseReplaceDocumentPromptProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);

  const replaceMutation = useMutation({
    mutationFn: () => {
      if (!replacementFile) {
        throw new Error('Selecione o documento substituto.');
      }
      return replacePurchaseDocument(requestId, replacementFile);
    },
    onSuccess: async () => {
      toast.success('Documento substituído.');
      setReplacementFile(null);
      setOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: certificateRequestDetailQueryKey(requestId),
        }),
        queryClient.invalidateQueries({
          queryKey: purchaseCertificateRequestsListQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: pendingPurchaseCertificateRequestsQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: certificateRequestsListQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: completedCertificateRequestsQueryKey,
        }),
      ]);
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Não foi possível substituir o documento.';
      toast.error(message);
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (replaceMutation.isPending) {
      return;
    }
    setOpen(nextOpen);
    if (!nextOpen) {
      setReplacementFile(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setReplacementFile(file);
  }

  function clearFile() {
    setReplacementFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Anexou o documento errado?{' '}
        <button
          type="button"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
          onClick={() => setOpen(true)}
        >
          Anexe outro documento
        </button>
        .
      </p>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="flex max-h-[min(90dvh,32rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden border-0 p-0 shadow-xl ring-0 sm:max-w-md"
          onInteractOutside={(event) => {
            if (replaceMutation.isPending) {
              event.preventDefault();
            }
          }}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
            <DialogHeader className="text-left">
              <DialogTitle>Substituir documento</DialogTitle>
              <DialogDescription>
                Envie o arquivo correto (PDF ou imagem). A solicitação permanece
                no mesmo status — apenas o anexo da NF é atualizado.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor={`purchase-replace-document-${requestId}`}>
                Novo documento
              </Label>
              <div
                className={
                  replacementFile
                    ? 'rounded-xl border border-brand/40 bg-brand/5 p-4'
                    : 'rounded-xl border border-dashed border-border bg-muted/20 p-4'
                }
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
                    <FileUp className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium break-all">
                      {replacementFile?.name ?? 'Nenhum arquivo selecionado'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PDF ou imagem, até 30 MB
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {replacementFile ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFile}
                      disabled={replaceMutation.isPending}
                    >
                      Remover
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={replaceMutation.isPending}
                    onClick={() => inputRef.current?.click()}
                  >
                    {replacementFile ? 'Trocar arquivo' : 'Escolher arquivo'}
                  </Button>
                </div>

                <input
                  ref={inputRef}
                  id={`purchase-replace-document-${requestId}`}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t border-border bg-muted/20 px-6 py-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={replaceMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              disabled={!replacementFile || replaceMutation.isPending}
              onClick={() => replaceMutation.mutate()}
            >
              {replaceMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Substituir documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
