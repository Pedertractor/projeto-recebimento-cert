import z from 'zod';

export const gridConfigSchema = z.object({
  id: z.number(),
  version: z.number().int().positive(),
  columns: z.number().int(),
  rows: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type GridConfigResponse = z.infer<typeof gridConfigSchema>;

export const upsertGridConfigBodySchema = z.object({
  columns: z
    .number()
    .int('Colunas deve ser um número inteiro')
    .min(1, 'Informe ao menos 1 coluna')
    .max(26, 'Máximo de 26 colunas'),
  rows: z
    .number()
    .int('Linhas deve ser um número inteiro')
    .min(1, 'Informe ao menos 1 linha')
    .max(26, 'Máximo de 26 linhas'),
});

export type UpsertGridConfigBody = z.infer<typeof upsertGridConfigBodySchema>;
