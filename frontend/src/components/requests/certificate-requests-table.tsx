import { useState } from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Form084PreviewDialog } from '@/components/conference/form-084-preview-dialog';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { SupplierLogo } from '@/components/suppliers/supplier-logo';
import { Button } from '@/components/ui/button';
import {
  MobileListCard,
  MobileListCardRow,
} from '@/components/ui/mobile-list-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  formatRequestDate,
  getInspectedCertificatesCount,
  getNfConferenceStatus,
} from '@/lib/certificate-request-labels';
import { cn } from '@/lib/utils';
import type { CertificateRequest } from '@/types/certificate-request';

type CertificateRequestsTableProps = {
  requests: CertificateRequest[];
  detailPath: (requestId: number) => string;
  variant: 'stock' | 'purchase' | 'conference';
  /** Atalho para a página de conferência da NF (ex.: estoque em minhas solicitações). */
  nfShortcutPath?: (requestId: number) => string;
};

type RequestSupplier = CertificateRequest['supplier'];

function showsSupplierLogo(
  tableVariant: CertificateRequestsTableProps['variant'],
): boolean {
  return tableVariant === 'conference' || tableVariant === 'purchase';
}

function SupplierWithLogoCell({ supplier }: { supplier: RequestSupplier }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="size-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-border/70">
        <SupplierLogo
          name={supplier.name}
          logoStoragePath={supplier.logoStoragePath}
        />
      </div>
      <span className="min-w-0 truncate">{supplier.name}</span>
    </div>
  );
}

export function CertificateRequestsTable({
  requests,
  detailPath,
  variant,
  nfShortcutPath,
}: CertificateRequestsTableProps) {
  const navigate = useNavigate();
  const [form084Request, setForm084Request] =
    useState<CertificateRequest | null>(null);
  const [form084Open, setForm084Open] = useState(false);

  function openForm084(request: CertificateRequest) {
    setForm084Request(request);
    setForm084Open(true);
  }

  function handleForm084OpenChange(open: boolean) {
    setForm084Open(open);
    if (!open) {
      setForm084Request(null);
    }
  }

  if (requests.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhuma solicitação encontrada.
      </p>
    );
  }

  function resolveStatus(request: CertificateRequest) {
    return variant === 'conference'
      ? getNfConferenceStatus(request)
      : request.status;
  }

  return (
    <>
      <div className="flex flex-col gap-3 p-3 md:hidden">
        {requests.map((request) => {
          const status = resolveStatus(request);

          return (
            <MobileListCard
              key={request.id}
              onClick={() => navigate(detailPath(request.id))}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-start gap-2.5">
                    {showsSupplierLogo(variant) ? (
                      <div className="size-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-border/70">
                        <SupplierLogo
                          name={request.supplier.name}
                          logoStoragePath={request.supplier.logoStoragePath}
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <p className="font-semibold">Solicitação #{request.id}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {request.supplier.name}
                      </p>
                    </div>
                  </div>
                  <RequestStatusBadge status={status} />
                </div>
                <div className="grid gap-2">
                  <MobileListCardRow
                    label="Nº NF"
                    value={request.invoiceNumber}
                  />
                  <MobileListCardRow
                    label="Lotes"
                    value={request.expectedCertificates}
                  />
                  {variant === 'conference' ? (
                    <MobileListCardRow
                      label="Comparados"
                      value={`${getInspectedCertificatesCount(request)}/${request.expectedCertificates}`}
                    />
                  ) : null}
                  <MobileListCardRow
                    label="Data NF"
                    value={formatRequestDate(request.invoiceDate)}
                  />
                  <MobileListCardRow
                    label={variant === 'purchase' ? 'Solicitante' : 'Abertura'}
                    value={
                      variant === 'purchase'
                        ? (request.createdByName ?? 'Operador de estoque')
                        : formatRequestDate(request.submittedAt)
                    }
                  />
                </div>
                {variant === 'conference' ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={(event) => {
                      event.stopPropagation();
                      openForm084(request);
                    }}
                  >
                    <FileText className="size-4" aria-hidden />
                    Visualizar FORM-084
                  </Button>
                ) : null}
                {nfShortcutPath ? (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5"
                  >
                    <Link
                      to={nfShortcutPath(request.id)}
                      onClick={(event) => event.stopPropagation()}
                    >
                      Ir para NF
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </MobileListCard>
          );
        })}
      </div>

      <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Solicitação</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Nº NF</TableHead>
            <TableHead>Lotes</TableHead>
            {variant === 'conference' ? (
              <TableHead>Comparados</TableHead>
            ) : null}
            <TableHead>Data NF</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              {variant === 'purchase' ? 'Solicitante' : 'Abertura'}
            </TableHead>
            {variant === 'conference' ? (
              <TableHead className="w-[1%] whitespace-nowrap">
                FORM-084
              </TableHead>
            ) : null}
            {nfShortcutPath ? (
              <TableHead className="w-[1%] whitespace-nowrap">Atalho</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow
              key={request.id}
              className={cn(
                'cursor-pointer transition-colors hover:bg-muted/50',
              )}
              onClick={() => navigate(detailPath(request.id))}
            >
              <TableCell className="font-medium">#{request.id}</TableCell>
              <TableCell>
                {showsSupplierLogo(variant) ? (
                  <SupplierWithLogoCell supplier={request.supplier} />
                ) : (
                  request.supplier.name
                )}
              </TableCell>
              <TableCell>{request.invoiceNumber}</TableCell>
              <TableCell>{request.expectedCertificates}</TableCell>
              {variant === 'conference' ? (
                <TableCell className="tabular-nums">
                  {getInspectedCertificatesCount(request)}/
                  {request.expectedCertificates}
                </TableCell>
              ) : null}
              <TableCell>{formatRequestDate(request.invoiceDate)}</TableCell>
              <TableCell>
                <RequestStatusBadge
                  status={
                    variant === 'conference'
                      ? getNfConferenceStatus(request)
                      : request.status
                  }
                />
              </TableCell>
              <TableCell>
                {variant === 'purchase'
                  ? (request.createdByName ?? 'Operador de estoque')
                  : formatRequestDate(request.submittedAt)}
              </TableCell>
              {variant === 'conference' ? (
                <TableCell
                  className="text-right"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => openForm084(request)}
                  >
                    <FileText className="size-4" aria-hidden />
                    Visualizar FORM-084
                  </Button>
                </TableCell>
              ) : null}
              {nfShortcutPath ? (
                <TableCell
                  className="text-right"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    <Link to={nfShortcutPath(request.id)}>
                      Ir para NF
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </Button>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      {variant === 'conference' ? (
        <Form084PreviewDialog
          request={form084Request}
          open={form084Open}
          onOpenChange={handleForm084OpenChange}
        />
      ) : null}
    </>
  );
}
