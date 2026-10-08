import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { useWebSession } from '@/hooks/auth/use-web-session';
import { HttpClientError } from '@/lib/http-client';
import { canDeleteInvoice } from '@/lib/role-access';
import {
  certificateRequestDetailQueryKey,
  certificateRequestsListQueryKey,
  completedCertificateRequestsQueryKey,
  deleteInvoice,
  pendingPurchaseCertificateRequestsQueryKey,
  purchaseCertificateRequestsListQueryKey,
  recentCertificateRequestsQueryKey,
} from '@/services/certificate-requests/certificate-request.service';

type DeleteInvoiceButtonProps = {
  requestId: number;
  invoiceNumber: string;
  supplierName: string;
  redirectTo?: string;
  className?: string;
};

export function DeleteInvoiceButton({
  requestId,
  invoiceNumber,
  supplierName,
  redirectTo,
  className,
}: DeleteInvoiceButtonProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: sessionUser } = useWebSession();
  const [open, setOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteInvoice(requestId),
    onSuccess: async (result) => {
      const count = result.deletedRequestIds.length;
      toast.success(
        count > 1
          ? `NF ${result.invoiceNumber} excluída, com ${count} solicitações vinculadas.`
          : `NF ${result.invoiceNumber} excluída.`,
      );
      setOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: certificateRequestsListQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: completedCertificateRequestsQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: purchaseCertificateRequestsListQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: pendingPurchaseCertificateRequestsQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: recentCertificateRequestsQueryKey,
        }),
        ...result.deletedRequestIds.map((id) =>
          queryClient.removeQueries({
            queryKey: certificateRequestDetailQueryKey(id),
          }),
        ),
      ]);
      if (redirectTo) {
        navigate(redirectTo);
      }
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : 'Não foi possível excluir a nota fiscal.';
      toast.error(message);
    },
  });

  if (!canDeleteInvoice(sessionUser?.role)) {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        className={className}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <Trash2 className="size-4" />
        Excluir NF
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-0 shadow-xl ring-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir a NF {invoiceNumber}?</DialogTitle>
            <DialogDescription>
              A nota fiscal de {supplierName} será excluída junto com todas as
              solicitações vinculadas a ela, inclusive anexos, conferências e o
              envio ao compras. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Voltar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Excluir NF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
