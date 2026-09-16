import { z } from 'zod';

export const createWeldDefectTypeFormSchema = z.object({
  code: z.string().trim().min(1, 'Informe o código do tipo de defeito.'),
  name: z.string().trim().min(1, 'Informe o nome do tipo de defeito.'),
});

export type CreateWeldDefectTypeFormValues = z.infer<
  typeof createWeldDefectTypeFormSchema
>;
