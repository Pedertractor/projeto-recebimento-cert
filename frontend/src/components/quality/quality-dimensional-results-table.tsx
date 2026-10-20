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
  showSpecified: boolean;
  showFound: boolean;
};

export function QualityDimensionalResultsTable({
  matches,
  comparisonReturnTo,
  showSpecified,
  showFound,
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
            {showSpecified ? (
              <>
                <TableHead className="text-muted-foreground">
                  Esp. NF
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Larg. NF
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Comp. NF
                </TableHead>
              </>
            ) : null}
            {showFound ? (
              <>
                <TableHead className="text-muted-foreground">
                  Esp. receb.
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Larg. receb.
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Comp. receb.
                </TableHead>
              </>
            ) : null}
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
              {showSpecified ? (
                <>
                  <TableCell className="tabular-nums">
                    {match.specified.thickness}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {match.specified.width}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {match.specified.length}
                  </TableCell>
                </>
              ) : null}
              {showFound ? (
                <>
                  <TableCell className="tabular-nums">
                    {match.found.thickness}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {match.found.width}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {match.found.length}
                  </TableCell>
                </>
              ) : null}
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
