import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BellRing } from 'lucide-react';
import { Link } from 'react-router-dom';

import { CertificateRequestSummary } from '@/components/requests/certificate-request-summary';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
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
import {
  listPendingPurchaseCertificateRequests,
  pendingPurchaseCertificateRequestsQueryKey,
} from '@/services/certificate-requests/certificate-request.service';

const SESSION_STORAGE_KEY = 'cq-purchase-pending-dialog-dismissed';

export function PurchasePendingRequestNotifier() {
  const { data: user } = useWebSession();
  const isPurchaseOperator = user?.role === 'PURCHASE_OPERATOR';
  const [open, setOpen] = useState(false);

  const pendingQuery = useQuery({
    queryKey: pendingPurchaseCertificateRequestsQueryKey,
    queryFn: listPendingPurchaseCertificateRequests,
    enabled: isPurchaseOperator,
  });

  const pendingRequests = pendingQuery.data ?? [];
  const latestRequest = pendingRequests[0] ?? null;

  useEffect(() => {
    if (!isPurchaseOperator || pendingQuery.isLoading || !latestRequest) {
      return;
    }

    const dismissed = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!dismissed) {
      setOpen(true);
    }
  }, [isPurchaseOperator, pendingQuery.isLoading, latestRequest]);

  if (!isPurchaseOperator || !latestRequest) {
    return null;
  }

  function handleOpenChange(nextOpen: boolean): void {
    setOpen(nextOpen);

    if (!nextOpen) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, '1');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,100%)] w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden border-0 p-0 shadow-2xl ring-0 sm:max-w-lg sm:w-full">
        <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <div className="bg-linear-to-br from-brand/10 via-background to-background px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
            <DialogHeader className="gap-0 text-left">
              <div className="flex items-start gap-3 pr-8">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand sm:size-11">
                  <BellRing className="size-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <DialogTitle className="text-lg font-semibold tracking-tight sm:text-xl">
                    Nova solicitação de certificado
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed">
                    O estoque abriu uma solicitação aguardando ação do compras.
                    {pendingRequests.length > 1
                      ? ` Há ${pendingRequests.length} solicitações pendentes.`
                      : null}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <p className="text-sm font-medium">Solicitação mais recente</p>
              <RequestStatusBadge
                status={latestRequest.status}
                className="w-fit shrink-0"
              />
            </div>

            <div className="min-w-0 rounded-2xl bg-muted/40 px-3 py-3 sm:px-4 sm:py-4">
              <CertificateRequestSummary request={latestRequest} compact />
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-col-reverse gap-2 border-t border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:justify-between sm:px-6 sm:py-4">
          <Button
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={() => handleOpenChange(false)}
          >
            Fechar
          </Button>
          <Button
            asChild
            className="w-full bg-brand text-brand-foreground hover:bg-brand/90 sm:w-auto"
            onClick={() => handleOpenChange(false)}
          >
            <Link to={`/compras/solicitacoes/${latestRequest.id}`}>
              Abrir solicitação
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
