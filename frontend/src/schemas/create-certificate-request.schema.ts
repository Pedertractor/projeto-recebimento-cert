import { z } from 'zod';

export const createCertificateRequestFormSchema = z.object({
  supplierId: z.number().int().positive('Selecione um fornecedor.'),
  invoiceNumber: z
    .string()
    .trim()
    .min(1, 'Informe o número da nota fiscal.')
    .max(30, 'Número da NF inválido.'),
  invoiceDate: z.string().min(1, 'Informe a data da NF.'),
  notes: z.string().trim().optional(),
  invoiceFile: z
    .instanceof(File, { message: 'Anexe a nota fiscal.' })
    .refine((file) => file.size > 0, 'Anexe a nota fiscal.'),
});

export type CreateCertificateRequestFormValues = z.infer<
  typeof createCertificateRequestFormSchema
>;
