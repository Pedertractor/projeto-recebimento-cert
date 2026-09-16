import { z } from 'zod';

export const createUserFormSchema = z.object({
  cardNumber: z
    .string()
    .trim()
    .min(1, 'Informe o cartão.')
    .max(16, 'Cartão inválido.'),
  unit: z.enum(['PEDERTRACTOR', 'TRACTOR'], {
    message: 'Selecione a unidade.',
  }),
  role: z.enum(['STOCK_OPERATOR', 'PURCHASE_OPERATOR', 'SUPERADMIN'], {
    message: 'Selecione a função.',
  }),
});

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;
