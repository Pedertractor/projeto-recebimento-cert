import { forwardRef } from 'react';
import {
  formatInspectionOkNok,
  formatReportStatus,
  getInspectionFieldValue,
  type QualityManagementFormColumn,
} from '@/lib/quality-management-form';
import { cn } from '@/lib/utils';

type QualityManagementFormSheetProps = {
  columns: QualityManagementFormColumn[];
  className?: string;
};

type FormRowDefinition = {
  label: string;
  getValue: (column: QualityManagementFormColumn) => string;
};

const FORM_ROWS: FormRowDefinition[] = [
  {
    label: 'DATA DO RECEBIM.',
    getValue: (column) =>
      getInspectionFieldValue(column.inspection, 'receiptDate'),
  },
  {
    label: 'DESCRIÇÃO DO MATERIAL',
    getValue: (column) =>
      getInspectionFieldValue(column.inspection, 'materialDescription'),
  },
  {
    label: 'RM:',
    getValue: (column) => getInspectionFieldValue(column.inspection, 'rm'),
  },
  {
    label: 'Nº CERTIFICADO',
    getValue: (column) =>
      getInspectionFieldValue(column.inspection, 'certificateNumber'),
  },
  {
    label: 'COMPOSIÇÃO QUIMICA OK ou N.OK',
    getValue: (column) =>
      formatInspectionOkNok(column.inspection?.chemicalComposition),
  },
  {
    label: 'QUANTIDADE ESPECIFICADA NA NOTA FISCAL',
    getValue: (column) =>
      getInspectionFieldValue(column.inspection, 'quantitySpecified'),
  },
  {
    label: 'QUANTIDADE ENCONTRADA NO RECEBIMENTO',
    getValue: (column) =>
      getInspectionFieldValue(column.inspection, 'quantityFound'),
  },
  {
    label: 'DIMENSIONAL ESPECIFICADO NF:',
    getValue: (column) =>
      getInspectionFieldValue(column.inspection, 'dimensionalSpecified'),
  },
  {
    label: 'DIMENSIONAL ENCONTRADO NO RECEBIMENTO',
    getValue: (column) =>
      getInspectionFieldValue(column.inspection, 'dimensionalFound'),
  },
  {
    label: 'VISUAL ENCONT. OK ou N.OK',
    getValue: (column) =>
      formatInspectionOkNok(column.inspection?.visualInspection),
  },
  {
    label: 'LAUDO AP. ou REP.',
    getValue: (column) => formatReportStatus(column.inspection?.reportStatus),
  },
  {
    label: 'RECEBEDOR RESP.',
    getValue: (column) =>
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
        'quality-management-form-sheet bg-white text-black print:bg-white print:text-black',
        className,
      )}
    >
      <div className="overflow-x-auto border border-black">
        <table className="w-full min-w-[720px] border-collapse text-[11px] leading-tight">
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="w-52 border border-black bg-white p-2 align-middle"
              >
                <div className="flex flex-col items-start gap-1 text-left">
                  <img
                    src="/pedertractor_tractorcomponents_azul.svg"
                    alt="Peder Tractor"
                    className="w-full"
                  />
                </div>
              </th>
              <th
                colSpan={columns.length}
                className="border border-black bg-white px-3 py-2 text-center"
              >
                <p className="text-[11px] font-bold uppercase">
                  Formulário do sistema de gestão da qualidade
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase">
                  Verificação / inspeção de recebimento de matéria prima para
                  chapas de laser
                </p>
              </th>
              <th
                rowSpan={2}
                className="w-28 border border-black bg-white p-2 align-middle"
              >
                <div className="flex flex-col gap-2 text-center text-[10px] font-bold">
                  <span>FORM- 084</span>
                  <span>Revisão: 04</span>
                </div>
              </th>
            </tr>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.lotIndex}
                  className="min-w-28 border border-black bg-white px-2 py-2 text-center align-top"
                >
                  <p className="font-bold uppercase">Fornecedor</p>
                  <p className="mt-1 font-semibold uppercase">
                    {column.supplierName}
                  </p>
                  <p className="mt-1 text-[10px] font-normal normal-case text-neutral-700">
                    {column.lotLabel}
                  </p>
                </th>
              ))}
            </tr>
            <tr>
              <td
                colSpan={columns.length + 2}
                className="border border-black bg-white px-3 py-1 text-left font-semibold uppercase"
              >
                Distribuição: S.G.Q./ RECEBIMENTO
              </td>
            </tr>
          </thead>
          <tbody>
            {FORM_ROWS.map((row) => (
              <tr key={row.label}>
                <td className="border border-black bg-white px-2 py-1.5 text-left font-semibold uppercase">
                  {row.label}
                </td>
                {columns.map((column) => (
                  <td
                    key={`${row.label}-${column.lotIndex}`}
                    className="border border-black bg-white px-2 py-1.5 text-center align-middle"
                  >
                    {row.getValue(column)}
                  </td>
                ))}
                <td className="border border-black bg-white" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-neutral-800">
        <span className="font-bold uppercase">Nota:</span> Para preencher este
        formulário utilize as informações contidas nos seguintes documentos:
        instrução de trabalho IT-034, instrução de trabalho IT-083, Nota fiscal
        do Produto e o Certificado. Caso haja alguma não conformidade, o produto
        deve ser identificado, segregado e o departamento de compras deve ser
        comunicado.
      </p>
    </div>
  );
});
