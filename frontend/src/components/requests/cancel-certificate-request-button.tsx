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
import { HttpClientError } from '@/lib/http-client';
import {
  cancelCertificateRequest,
  certificateRequestDetailQueryKey,
  certificateRequestsListQueryKey,
  pendingPurchaseCertificateRequestsQueryKey,
  purchaseCertificateRequestsListQueryKey,
} from '@/services/certificate-requests/certificate-request.service';
import type { CertificateRequest } from '@/types/certificate-request';

type CancelCertificateRequestButtonProps = {
  request: CertificateRequest;
};

export function CancelCertificateRequestButton({
  request,
}: CancelCertificateRequestButtonProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const cancelMutation = useMutation({
    mutationFn: () => cancelCertificateRequest(request.id),
    onSuccess: async () => {
      toast.success(`Solicitação #${request.id} cancelada.`);
      setOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: certificateRequestsListQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: purchaseCertificateRequestsListQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: pendingPurchaseCertificateRequestsQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: certificateRequestDetailQueryKey(request.id),
        }),
      ]);
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : 'Não foi possível cancelar a solicitação.';
      toast.error(message);
    },
  });

  if (
    request.status !== 'AGUARDANDO_COMPRAS' &&
    request.status !== 'CADASTRADA'
  ) {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        Cancelar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-0 shadow-xl ring-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar solicitação #{request.id}?</DialogTitle>
            <DialogDescription>
              Esta ação só é permitida enquanto o compras ainda não registrou o
              envio ao fornecedor. A solicitação ficará com status cancelada e
              não poderá ser retomada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={cancelMutation.isPending}
            >
              Voltar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              {cancelMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Confirmar cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
