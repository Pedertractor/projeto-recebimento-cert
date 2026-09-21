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
      <DialogContent className="gap-0 overflow-hidden border-0 p-0 shadow-2xl ring-0 sm:max-w-lg">
        <div className="bg-linear-to-br from-brand/10 via-background to-background px-6 pt-6 pb-4">
          <DialogHeader className="gap-3 text-left">
            <div className="flex size-11 items-center justify-center rounded-full bg-brand/15 text-brand">
              <BellRing className="size-5" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                Nova solicitação de certificado
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                O estoque abriu uma solicitação aguardando ação do compras.
                {pendingRequests.length > 1
                  ? ` Há ${pendingRequests.length} solicitações pendentes.`
                  : null}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Solicitação mais recente</p>
            <RequestStatusBadge status={latestRequest.status} />
          </div>

          <div className="rounded-2xl bg-muted/40 px-4 py-4">
            <CertificateRequestSummary request={latestRequest} compact />
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-border/60 bg-muted/20 px-6 py-4 sm:justify-between">
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Fechar
          </Button>
          <Button
            asChild
            className="bg-brand text-brand-foreground hover:bg-brand/90"
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
