import { useState, type MouseEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Mail } from 'lucide-react';
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
import { canRequestPurchaseDocument } from '@/lib/certificate-request-purchase-document';
import { HttpClientError } from '@/lib/http-client';
import { cn } from '@/lib/utils';
import {
  certificateRequestDetailQueryKey,
  certificateRequestsListQueryKey,
  completedCertificateRequestsQueryKey,
  pendingPurchaseCertificateRequestsQueryKey,
  requestDocumentFromPurchase,
} from '@/services/certificate-requests/certificate-request.service';
import type { CertificateRequest } from '@/types/certificate-request';

type InvoiceCertificatePromptProps = {
  request: CertificateRequest;
  variant?: 'inline' | 'card' | 'button';
  className?: string;
};

export function InvoiceCertificatePrompt({
  request,
  variant = 'inline',
  className,
}: InvoiceCertificatePromptProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const requestMutation = useMutation({
    mutationFn: () => requestDocumentFromPurchase(request.id),
    onSuccess: async () => {
      toast.success('Solicitação enviada ao compras.');
      setOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: certificateRequestDetailQueryKey(request.id),
        }),
        queryClient.invalidateQueries({
          queryKey: completedCertificateRequestsQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: certificateRequestsListQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: pendingPurchaseCertificateRequestsQueryKey,
        }),
      ]);
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : 'Não foi possível solicitar o documento ao compras.';
      toast.error(message);
    },
  });

  if (!canRequestPurchaseDocument(request)) {
    return null;
  }

  function openDialog(event?: MouseEvent): void {
    event?.stopPropagation();
    setOpen(true);
  }

  const dialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-0 shadow-xl ring-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar documentos ao compras?</DialogTitle>
          <DialogDescription>
            O compras irá receber uma notificação para solicitar todos os
            certificados junto à NF. Confirme apenas se ainda não possui o PDF
            completo com a nota fiscal e os certificados.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={requestMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            disabled={requestMutation.isPending}
            onClick={() => requestMutation.mutate()}
          >
            {requestMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Confirmar solicitação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (variant === 'card') {
    return (
      <>
        <section
          className={cn(
            'rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60 sm:p-6',
            className,
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-brand" />
                <h2 className="text-base font-semibold">
                  Solicitar documentos ao compras
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Ainda não tem o PDF com a NF e todos os certificados? Envie uma
                solicitação ao compras — mesmo que já tenha anexado outro
                documento ou concluído a conferência por lote.
              </p>
            </div>
            <Button
              type="button"
              className="w-full shrink-0 bg-brand text-brand-foreground hover:bg-brand/90 sm:w-auto"
              onClick={() => openDialog()}
            >
              <Mail className="size-4" />
              Criar solicitação
            </Button>
          </div>
        </section>
        {dialog}
      </>
    );
  }

  if (variant === 'button') {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('gap-1.5', className)}
          onClick={openDialog}
        >
          <Mail className="size-4" />
          Solicitar ao compras
        </Button>
        {dialog}
      </>
    );
  }

  return (
    <>
      <p className={cn('text-sm text-muted-foreground', className)}>
        Está sem todos certificados? Então{' '}
        <button
          type="button"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
          onClick={() => openDialog()}
        >
          solicite ao fornecimento
        </button>
        .
      </p>
      {dialog}
    </>
  );
}
