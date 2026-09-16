import { z } from 'zod';
import { getCnpjValidationMessage } from '@/utils/cnpj';

export const createSupplierFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do fornecedor.'),
  cnpj: z
    .string()
    .trim()
    .min(1, 'Informe o CNPJ.')
    .superRefine((value, context) => {
      const message = getCnpjValidationMessage(value);
      if (message) {
        context.addIssue({
          code: 'custom',
          message,
        });
      }
    }),
  description: z.string().trim().optional(),
});

export type CreateSupplierFormValues = z.infer<typeof createSupplierFormSchema>;
