import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { CancelCertificateRequestButton } from '@/components/requests/cancel-certificate-request-button';
import { CertificateRequestSummary } from '@/components/requests/certificate-request-summary';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CertificateRequest } from '@/types/certificate-request';

type PurchaseRequestWaitingBannerProps = {
  request: CertificateRequest;
};

export function PurchaseRequestWaitingBanner({
  request,
}: PurchaseRequestWaitingBannerProps) {
  const [open, setOpen] = useState(false);
  const canCancelRequest = request.status === 'AGUARDANDO_COMPRAS';

  return (
    <>
      <p className="rounded-2xl bg-amber-50 px-4 py-4 text-sm text-amber-950 ring-1 ring-amber-200">
        Solicitação enviada ao compras. Quando o documento chegar, ele substitui
        a nota fiscal desta tela.{' '}
        <button
          type="button"
          className="underline underline-offset-2 transition-colors hover:text-amber-900"
          onClick={() => setOpen(true)}
        >
          Ver detalhes da solicitação
        </button>
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-0 shadow-xl ring-0 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              Solicitação #{request.id}
              <RequestStatusBadge status={request.status} />
            </DialogTitle>
            <DialogDescription>
              Acompanhe o andamento ou cancele enquanto o compras ainda não
              registrou o envio ao fornecedor.
            </DialogDescription>
          </DialogHeader>

          <CertificateRequestSummary request={request} compact />

          <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
            {canCancelRequest ? (
              <CancelCertificateRequestButton
                request={request}
                label="Cancelar solicitação"
                className="h-10 w-full border border-destructive/30 px-4 text-sm hover:bg-destructive/5 sm:w-auto"
                onCancelled={() => setOpen(false)}
              />
            ) : null}
            <Button
              asChild
              className="group w-full bg-brand text-brand-foreground hover:bg-brand/90 sm:w-auto"
            >
              <Link to={`/minhas-solicitacoes/${request.id}`}>
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
                Ir acompanhar solicitação
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
