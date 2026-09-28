import { z } from 'zod';

export const createSupplierFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do fornecedor.'),
  cnpj: z.string().trim().min(1, 'Informe o CNPJ.'),
  epromSupplierNumber: z
    .string()
    .trim()
    .min(1, 'Informe o número do fornecedor no EPROM.'),
  description: z.string().trim().optional(),
});

export type CreateSupplierFormValues = z.infer<typeof createSupplierFormSchema>;
