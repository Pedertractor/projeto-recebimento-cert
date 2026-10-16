import { httpClient } from '@/lib/http-client';
import type { ProductType } from '@/types/product-type';

export const productTypesListQueryKey = ['product-types'] as const;

export const productTypeOptionsQueryKey = ['product-types', 'options'] as const;

export function listProductTypes(): Promise<ProductType[]> {
  return httpClient.get<ProductType[]>('/product-types');
}

export function listProductTypeOptions(): Promise<ProductType[]> {
  return httpClient.get<ProductType[]>('/product-types/options');
}

export type CreateProductTypePayload = {
  name: string;
  code: string;
};

export function createProductType(
  payload: CreateProductTypePayload,
): Promise<ProductType> {
  return httpClient.post<ProductType, CreateProductTypePayload>(
    '/product-types',
    payload,
  );
}
