import { forwardRef, type ReactNode } from 'react';
import {
  formatInspectionOkNok,
  formatReportStatus,
  getInspectionFieldValue,
  type QualityManagementFormColumn,
} from '@/lib/quality-management-form';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type QualityManagementFormSheetProps = {
  columns: QualityManagementFormColumn[];
  className?: string;
};

type FormRowDefinition = {
  label: string;
  render: (column: QualityManagementFormColumn) => ReactNode;
};

function FormStatusBadge({
  value,
  type,
}: {
  value: 'OK' | 'NOK' | null | undefined;
  type: 'ok-nok' | 'report';
}) {
  if (!value) {
    return <span className="text-muted-foreground">—</span>;
  }

  const isOk = value === 'OK';
  const label =
    type === 'ok-nok'
      ? formatInspectionOkNok(value)
      : formatReportStatus(value);

  return (
    <Badge
      variant={isOk ? 'default' : 'destructive'}
      className="font-semibold uppercase"
    >
      {label}
    </Badge>
  );
}

const FORM_ROWS: FormRowDefinition[] = [
  {
    label: 'Data do recebimento',
    render: (column) =>
      getInspectionFieldValue(column.inspection, 'receiptDate'),
  },
  {
    label: 'Descrição do material',
    render: (column) =>
      getInspectionFieldValue(column.inspection, 'materialDescription'),
  },
  {
    label: 'RM',
    render: (column) => getInspectionFieldValue(column.inspection, 'rm'),
  },
  {
    label: 'Nº certificado',
    render: (column) =>
      getInspectionFieldValue(column.inspection, 'certificateNumber'),
  },
  {
    label: 'Composição química',
    render: (column) => (
      <FormStatusBadge
        value={column.inspection?.chemicalComposition}
        type="ok-nok"
      />
    ),
  },
  {
    label: 'Quantidade especificada na NF',
    render: (column) =>
      getInspectionFieldValue(column.inspection, 'quantitySpecified'),
  },
  {
    label: 'Quantidade encontrada no recebimento',
    render: (column) =>
      getInspectionFieldValue(column.inspection, 'quantityFound'),
  },
  {
    label: 'Dimensional especificado NF',
    render: (column) =>
      getInspectionFieldValue(column.inspection, 'dimensionalSpecified'),
  },
  {
    label: 'Dimensional encontrado no recebimento',
    render: (column) =>
      getInspectionFieldValue(column.inspection, 'dimensionalFound'),
  },
  {
    label: 'Visual',
    render: (column) => (
      <FormStatusBadge
        value={column.inspection?.visualInspection}
        type="ok-nok"
      />
    ),
  },
  {
    label: 'Laudo',
    render: (column) => (
      <FormStatusBadge
        value={column.inspection?.reportStatus}
        type="report"
      />
    ),
  },
  {
    label: 'Recebedor responsável',
    render: (column) =>
      getInspectionFieldValue(column.inspection, 'receiverResponsible'),
  },
];

export const QualityManagementFormSheet = forwardRef<
  HTMLDivElement,
  QualityManagementFormSheetProps
>(function QualityManagementFormSheet({ columns, className }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'quality-management-form-sheet print:bg-white print:text-black',
        className,
      )}
    >
      <Card className="overflow-hidden rounded-lg border shadow-sm print:rounded-none print:shadow-none print:ring-1 print:ring-black">
        <CardHeader className="gap-4 border-b bg-muted/30 pb-4 print:bg-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <img
              src="/pedertractor_tractorcomponents_azul.svg"
              alt="Peder Tractor"
              className="h-12 w-auto shrink-0"
            />
            <div className="flex-1 text-center sm:px-4">
              <CardTitle className="text-sm font-bold uppercase sm:text-base">
                Formulário do sistema de gestão da qualidade
              </CardTitle>
              <CardDescription className="mt-1 text-xs font-medium uppercase">
                Verificação / inspeção de recebimento de matéria prima para
                chapas de laser
              </CardDescription>
            </div>
            <div className="flex flex-col items-center gap-1 sm:items-end">
              <Badge variant="outline" className="font-bold">
                FORM-084
              </Badge>
              <span className="text-xs font-medium text-muted-foreground">
                Revisão: 04
              </span>
            </div>
          </div>
          <Badge variant="secondary" className="w-fit font-medium">
            Distribuição: S.G.Q. / Recebimento
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          <Table className="min-w-180 text-xs">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="sticky left-0 z-10 min-w-52 bg-muted/50 font-semibold">
                  Campo
                </TableHead>
                {columns.map((column) => (
                  <TableHead
                    key={column.lotIndex}
                    className="min-w-40 text-center align-top"
                  >
                    <p className="font-semibold uppercase">
                      {column.supplierName}
                    </p>
                    <p className="mt-0.5 text-[10px] font-normal normal-case text-muted-foreground">
                      {column.lotLabel}
                    </p>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {FORM_ROWS.map((row) => (
                <TableRow key={row.label} className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 z-10 bg-background font-medium text-muted-foreground">
                    {row.label}
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell
                      key={`${row.label}-${column.lotIndex}`}
                      className="text-center"
                    >
                      {row.render(column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="border-t bg-muted/20 text-[10px] leading-relaxed text-muted-foreground print:bg-white">
          <p>
            <span className="font-semibold uppercase text-foreground">Nota:</span>{' '}
            Para preencher este formulário utilize as informações contidas nos
            seguintes documentos: instrução de trabalho IT-034, instrução de
            trabalho IT-083, Nota fiscal do Produto e o Certificado. Caso haja
            alguma não conformidade, o produto deve ser identificado, segregado
            e o departamento de compras deve ser comunicado.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
});
