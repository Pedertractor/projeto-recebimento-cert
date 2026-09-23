import z from 'zod';

export const supplierSchema = z.object({
  id: z.number(),
  name: z.string(),
  cnpj: z.string(),
  description: z.string().nullable(),
  logoStoragePath: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PublicSupplier = z.infer<typeof supplierSchema>;

export const listSuppliersQuerySchema = z.object({
  search: z.string().trim().optional(),
});

export type ListSuppliersQuery = z.infer<typeof listSuppliersQuerySchema>;

export const listSuppliersResponseSchema = z.array(supplierSchema);

export const createSupplierBodySchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do fornecedor.'),
  cnpj: z.string().trim().min(1, 'Informe o CNPJ.'),
  description: z.string().trim().optional(),
});

export type CreateSupplierBody = z.infer<typeof createSupplierBodySchema>;

export const updateSupplierBodySchema = createSupplierBodySchema;
export type UpdateSupplierBody = CreateSupplierBody;

export const createSupplierResponseSchema = supplierSchema;

export const supplierIdParamsSchema = z.object({
  id: z
    .string()
    .regex(/^[1-9]\d*$/, 'ID inválido')
    .transform(Number),
});

export type SupplierIdParams = z.infer<typeof supplierIdParamsSchema>;
