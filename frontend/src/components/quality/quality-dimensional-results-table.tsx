import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
import type { QualityDimensionalSearchMatch } from '@/lib/quality-dimensional-filters';

type QualityDimensionalResultsTableProps = {
  matches: QualityDimensionalSearchMatch[];
  comparisonReturnTo: string;
};

export function QualityDimensionalResultsTable({
  matches,
  comparisonReturnTo,
}: QualityDimensionalResultsTableProps) {
  if (matches.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
        <p className="text-sm font-medium text-foreground">
          Nenhum certificado encontrado com esses dimensionais.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajuste espessura, largura ou comprimento e tente novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NF</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Lote</TableHead>
            <TableHead>Espessura</TableHead>
            <TableHead>Largura</TableHead>
            <TableHead>Comprimento</TableHead>
            <TableHead>Conferido em</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match) => (
            <TableRow key={`${match.requestId}-${match.lotIndex}`}>
              <TableCell className="font-medium">{match.invoiceNumber}</TableCell>
              <TableCell className="max-w-[12rem] truncate">
                {match.supplierName}
              </TableCell>
              <TableCell>{match.lotLabel}</TableCell>
              <TableCell className="tabular-nums">{match.thickness}</TableCell>
              <TableCell className="tabular-nums">{match.width}</TableCell>
              <TableCell className="tabular-nums">{match.length}</TableCell>
              <TableCell>{formatRequestDate(match.inspectedAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex flex-wrap justify-end gap-1">
                  <Button asChild variant="ghost" size="sm" className="gap-1">
                    <Link to={`/notas-fiscais/${match.requestId}`}>
                      Ver NF
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="gap-1">
                    <Link
                      to={`/notas-fiscais/${match.requestId}/comparacao/${match.attachmentId}`}
                      state={{ returnTo: comparisonReturnTo }}
                    >
                      Comparação
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
