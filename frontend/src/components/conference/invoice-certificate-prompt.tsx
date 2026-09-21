import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
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
};

export function InvoiceCertificatePrompt({
  request,
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

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Está sem todos certificados? Então{' '}
        <button
          type="button"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
          onClick={() => setOpen(true)}
        >
          solicite ao fornecimento
        </button>
        .
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-0 shadow-xl ring-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar documentos ao compras?</DialogTitle>
            <DialogDescription>
              O compras irá receber uma notificação para solicitar todos os
              certificados junto à NF. Confirme apenas se ainda não possui o
              PDF completo com a nota fiscal e os certificados.
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
    </>
  );
}
