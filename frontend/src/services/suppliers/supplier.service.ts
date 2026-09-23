import axios from 'axios';

import { env } from '@/config/env';
import { getWebCsrfToken, httpClient, HttpClientError } from '@/lib/http-client';
import type {
  Supplier,
  CreateSupplierPayload,
  UpdateSupplierPayload,
} from '@/types/supplier';

export const suppliersListQueryKey = ['suppliers'] as const;

export type SaveSupplierOptions = {
  logoFile?: File | null;
  removeLogo?: boolean;
};

function appendSupplierFields(
  formData: FormData,
  payload: CreateSupplierPayload,
): void {
  formData.append('name', payload.name);
  formData.append('cnpj', payload.cnpj);
  if (payload.description?.trim()) {
    formData.append('description', payload.description.trim());
  }
}

function buildSupplierFormData(
  payload: CreateSupplierPayload,
  options?: SaveSupplierOptions,
): FormData {
  const formData = new FormData();
  appendSupplierFields(formData, payload);
  if (options?.logoFile) {
    formData.append('logoFile', options.logoFile);
  }
  if (options?.removeLogo) {
    formData.append('removeLogo', 'true');
  }
  return formData;
}

function readSupplierSaveErrorMessage(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return 'Não foi possível salvar o fornecedor.';
  }
  const record = data as Record<string, unknown>;
  if (typeof record.message === 'string' && record.message.trim()) {
    if (record.message === 'ValidationError' && typeof record.errors === 'string') {
      return record.errors.trim() || record.message;
    }
    if (record.message !== 'ValidationError') {
      return record.message;
    }
  }
  if (typeof record.errors === 'string' && record.errors.trim()) {
    return record.errors.trim();
  }
  return 'Não foi possível salvar o fornecedor.';
}

async function postSupplierMultipart(
  url: string,
  formData: FormData,
  method: 'POST' | 'PATCH',
): Promise<Supplier> {
  try {
    const response = await axios.request<Supplier>({
      method,
      url: `${env.apiUrl}${url}`,
      data: formData,
      withCredentials: true,
      headers: {
        'x-csrf-token': getWebCsrfToken() ?? '',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new HttpClientError({
        message: readSupplierSaveErrorMessage(error.response?.data),
        statusCode: error.response?.status,
      });
    }
    throw error;
  }
}

export function listSuppliers(search?: string): Promise<Supplier[]> {
  return httpClient.get<Supplier[]>('/suppliers', {
    params: search ? { search } : undefined,
  });
}

export function createSupplier(
  payload: CreateSupplierPayload,
  options?: SaveSupplierOptions,
): Promise<Supplier> {
  const formData = buildSupplierFormData(payload, options);
  return postSupplierMultipart('/suppliers', formData, 'POST');
}

export function updateSupplier(
  id: number,
  payload: UpdateSupplierPayload,
  options?: SaveSupplierOptions,
): Promise<Supplier> {
  const formData = buildSupplierFormData(payload, options);
  return postSupplierMultipart(`/suppliers/${id}`, formData, 'PATCH');
}
