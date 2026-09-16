import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

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
import { formatRequestDate } from '@/lib/certificate-request-labels';
import {
  certificateRequestsListQueryKey,
  listCertificateRequests,
} from '@/services/certificate-requests/certificate-request.service';

export function MinhasSolicitacoesPage() {
  const requestsQuery = useQuery({
    queryKey: certificateRequestsListQueryKey,
    queryFn: listCertificateRequests,
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Minhas solicitações
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe o andamento das solicitações abertas pelo estoque.
          </p>
        </div>
        <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
          <Link to="/solicitar-certificado">Nova solicitação</Link>
        </Button>
      </div>

      {requestsQuery.isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {requestsQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Não foi possível carregar as solicitações.
          </p>
        </div>
      ) : null}

      {requestsQuery.isSuccess ? (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitação</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Nº NF</TableHead>
                <TableHead>Data NF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Abertura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requestsQuery.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      Nenhuma solicitação encontrada.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                requestsQuery.data.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">#{request.id}</TableCell>
                    <TableCell>{request.supplier.name}</TableCell>
                    <TableCell>{request.invoiceNumber}</TableCell>
                    <TableCell>
                      {formatRequestDate(request.invoiceDate)}
                    </TableCell>
                    <TableCell>
                      <RequestStatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>
                      {formatRequestDate(request.submittedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}
