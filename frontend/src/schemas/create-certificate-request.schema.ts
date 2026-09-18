import { z } from 'zod';

export const createCertificateRequestFormSchema = z.object({
  supplierId: z.number().int().positive('Selecione um fornecedor.'),
  invoiceNumber: z
    .string()
    .trim()
    .min(1, 'Informe o número da nota fiscal.')
    .max(30, 'Número da NF inválido.'),
  invoiceDate: z.string().min(1, 'Informe a data da NF.'),
  expectedCertificates: z.coerce
    .number()
    .int('Informe a quantidade de lotes.')
    .min(1, 'Informe pelo menos 1 lote na NF.')
    .max(99, 'Quantidade de lotes inválida.'),
  notes: z.string().trim().optional(),
  invoiceFile: z
    .instanceof(File)
    .refine(
      (file) => file.size > 0 && file.size <= 10 * 1024 * 1024,
      'PDF ou imagem, até 10 MB.',
    )
    .optional(),
});

export type CreateCertificateRequestFormValues = z.infer<
  typeof createCertificateRequestFormSchema
>;
