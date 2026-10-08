import { z } from 'zod';

export const gridConfigFormSchema = z.object({
  columns: z.coerce
    .number()
    .int('Colunas deve ser um número inteiro')
    .min(1, 'Informe ao menos 1 coluna')
    .max(26, 'Máximo de 26 colunas'),
  rows: z.coerce
    .number()
    .int('Linhas deve ser um número inteiro')
    .min(1, 'Informe ao menos 1 linha')
    .max(26, 'Máximo de 26 linhas'),
});

export type GridConfigFormValues = z.infer<typeof gridConfigFormSchema>;

export function rowLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

export function cellCoordinate(rowIndex: number, columnNumber: number): string {
  return `${rowLabel(rowIndex)}${columnNumber}`;
}
