import { useState } from 'react';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Form084PreviewDialog } from '@/components/conference/form-084-preview-dialog';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import { Button } from '@/components/ui/button';
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
};

export function CertificateRequestsTable({
  requests,
  detailPath,
  variant,
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

  return (
    <>
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
            <TableHead className="w-[1%] whitespace-nowrap">FORM-084</TableHead>
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
            <TableCell>{request.supplier.name}</TableCell>
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
                  Visualizar
                </Button>
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
