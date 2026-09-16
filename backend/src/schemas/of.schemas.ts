import z from 'zod';

export const externalOfResponseSchema = z.object({
  ofNumber: z.string(),
  partCode: z.string(),
  partNumber: z.string(),
  date: z.string(),
  quantity: z.number(),
  originalQuantity: z.number(),
  serialNumber: z.number().nullable(),
  observation: z.string(),
});

export type ExternalOfResponseDto = z.infer<typeof externalOfResponseSchema>;

export const getOfByNumberParamsSchema = z.object({
  ofNumber: z.string().trim().min(1, 'Informe o número da OF.'),
});

export type GetOfByNumberParams = z.infer<typeof getOfByNumberParamsSchema>;

export const externalProcessResponseSchema = z.object({
  OF: z.number(),
  OP: z.number(),
  QTD: z.number(),
  QTD_APT: z.number(),
  employeeName: z.string().nullable(),
  employeeCard: z.string().nullable(),
  employeeUnit: z.string().nullable(),
  employeeId: z.number().nullable(),
  costCenter: z.string(),
  nameSector: z.string().nullable(),
});

export type ExternalProcessResponseDto = z.infer<
  typeof externalProcessResponseSchema
>;
