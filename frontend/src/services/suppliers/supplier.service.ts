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
      const message =
        typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : 'Não foi possível salvar o fornecedor.';
      throw new HttpClientError({
        message,
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
  if (!options?.logoFile) {
    return httpClient.post<Supplier, CreateSupplierPayload>(
      '/suppliers',
      payload,
    );
  }

  const formData = new FormData();
  appendSupplierFields(formData, payload);
  formData.append('logoFile', options.logoFile);
  return postSupplierMultipart('/suppliers', formData, 'POST');
}

export function updateSupplier(
  id: number,
  payload: UpdateSupplierPayload,
  options?: SaveSupplierOptions,
): Promise<Supplier> {
  if (!options?.logoFile && !options?.removeLogo) {
    return httpClient.patch<Supplier, UpdateSupplierPayload>(
      `/suppliers/${id}`,
      payload,
    );
  }

  const formData = new FormData();
  appendSupplierFields(formData, payload);
  if (options.logoFile) {
    formData.append('logoFile', options.logoFile);
  }
  if (options.removeLogo) {
    formData.append('removeLogo', 'true');
  }
  return postSupplierMultipart(`/suppliers/${id}`, formData, 'PATCH');
}
