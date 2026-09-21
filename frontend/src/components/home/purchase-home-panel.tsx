import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { formatRequestDate } from '@/lib/certificate-request-labels';
import type { CertificateRequest } from '@/types/certificate-request';

type PurchaseHomePanelProps = {
  requests: CertificateRequest[] | undefined;
  isLoading: boolean;
  isError: boolean;
};

export function PurchaseHomePanel({
  requests,
  isLoading,
  isError,
}: PurchaseHomePanelProps) {
  const openRequests =
    requests?.filter(
      (request) =>
        request.status !== 'CONCLUIDA' && request.status !== 'CANCELADA',
    ) ?? [];

  return (
    <aside className="flex min-h-0 h-full flex-col lg:col-span-1">
      <section className="flex min-h-0 h-full flex-1 flex-col rounded-2xl bg-card px-4 py-4 shadow-sm ring-1 ring-border/60">
        <div className="mb-3 shrink-0">
          <h2 className="text-sm font-semibold">Solicitações em aberto</h2>
          <p className="text-xs text-muted-foreground">
            Pedidos para envio de e-mail ao fornecedor.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        {isError ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar as solicitações.
          </p>
        ) : null}

        {!isLoading && !isError && openRequests.length === 0 ? (
          <p className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
            Nenhuma solicitação em aberto.
          </p>
        ) : null}

        {!isLoading && !isError && openRequests.length > 0 ? (
          <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
            {openRequests.map((request) => (
              <li key={request.id}>
                <Link
                  to={`/compras/solicitacoes/${request.id}`}
                  className="flex flex-col gap-1 rounded-xl px-2.5 py-2 transition-colors hover:bg-muted/70"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-medium">
                      NF {request.invoiceNumber}
                    </p>
                    <RequestStatusBadge
                      status={request.status}
                      className="shrink-0"
                    />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {request.supplier.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRequestDate(request.invoiceDate)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </aside>
  );
}
