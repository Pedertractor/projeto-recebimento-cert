export type Supplier = {
  id: number;
  name: string;
  cnpj: string;
  description: string | null;
  logoStoragePath: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateSupplierPayload = {
  name: string;
  cnpj: string;
  description?: string;
};

export type UpdateSupplierPayload = CreateSupplierPayload;
