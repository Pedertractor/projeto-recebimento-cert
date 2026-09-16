import { z } from 'zod';

export const updateWeldDefectTypeFormSchema = z.object({
  code: z.string().trim().min(1, 'Informe o código do tipo de defeito.'),
  name: z.string().trim().min(1, 'Informe o nome do tipo de defeito.'),
});

export type UpdateWeldDefectTypeFormValues = z.infer<
  typeof updateWeldDefectTypeFormSchema
>;
