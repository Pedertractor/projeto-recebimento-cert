import { useNavigate } from 'react-router-dom';

import { RequestStatusBadge } from '@/components/requests/request-status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatRequestDate } from '@/lib/certificate-request-labels';
import { cn } from '@/lib/utils';
import type { CertificateRequest } from '@/types/certificate-request';

type CertificateRequestsTableProps = {
  requests: CertificateRequest[];
  detailPath: (requestId: number) => string;
  variant: 'stock' | 'purchase';
};

export function CertificateRequestsTable({
  requests,
  detailPath,
  variant,
}: CertificateRequestsTableProps) {
  const navigate = useNavigate();

  if (requests.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhuma solicitação encontrada.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Solicitação</TableHead>
          <TableHead>Fornecedor</TableHead>
          <TableHead>Nº NF</TableHead>
          <TableHead>Lotes</TableHead>
          <TableHead>Data NF</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            {variant === 'stock' ? 'Abertura' : 'Solicitante'}
          </TableHead>
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
            <TableCell>{formatRequestDate(request.invoiceDate)}</TableCell>
            <TableCell>
              <RequestStatusBadge status={request.status} />
            </TableCell>
            <TableCell>
              {variant === 'stock'
                ? formatRequestDate(request.submittedAt)
                : (request.createdByName ?? 'Operador de estoque')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
