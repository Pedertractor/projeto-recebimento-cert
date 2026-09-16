import { httpClient } from '@/lib/http-client';
import type { Supplier, CreateSupplierPayload } from '@/types/supplier';

export const suppliersListQueryKey = ['suppliers'] as const;

export function listSuppliers(search?: string): Promise<Supplier[]> {
  return httpClient.get<Supplier[]>('/suppliers', {
    params: search ? { search } : undefined,
  });
}

export function createSupplier(payload: CreateSupplierPayload): Promise<Supplier> {
  return httpClient.post<Supplier, CreateSupplierPayload>('/suppliers', payload);
}
