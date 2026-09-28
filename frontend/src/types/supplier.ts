export type Supplier = {
  id: number;
  name: string;
  cnpj: string;
  description: string | null;
  epromSupplierNumber: string | null;
  logoStoragePath: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateSupplierPayload = {
  name: string;
  cnpj: string;
  description?: string;
  epromSupplierNumber?: string;
};

export type UpdateSupplierPayload = CreateSupplierPayload;
