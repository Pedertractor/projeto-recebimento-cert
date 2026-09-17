import axios from 'axios';
import { env } from '@/config/env';
import { getWebCsrfToken } from '@/lib/http-client';
import { httpClient } from '@/lib/http-client';
import type {
  CertificateRequest,
  CreateCertificateRequestPayload,
} from '@/types/certificate-request';

export const certificateRequestsListQueryKey = [
  'certificate-requests',
] as const;

export const purchaseCertificateRequestsListQueryKey = [
  'certificate-requests',
  'purchase',
] as const;

export const pendingPurchaseCertificateRequestsQueryKey = [
  'certificate-requests',
  'purchase',
  'pending',
] as const;

export const recentCertificateRequestsQueryKey = [
  'certificate-requests',
  'recent',
] as const;

export function certificateRequestDetailQueryKey(id: number) {
  return ['certificate-requests', id] as const;
}

export function listCertificateRequests(): Promise<CertificateRequest[]> {
  return httpClient.get<CertificateRequest[]>('/certificate-requests');
}

export function listPurchaseCertificateRequests(): Promise<CertificateRequest[]> {
  return httpClient.get<CertificateRequest[]>('/certificate-requests/purchase');
}

export function listPendingPurchaseCertificateRequests(): Promise<
  CertificateRequest[]
> {
  return httpClient.get<CertificateRequest[]>(
    '/certificate-requests/purchase/pending',
  );
}

export function listRecentCertificateRequests(): Promise<CertificateRequest[]> {
  return httpClient.get<CertificateRequest[]>('/certificate-requests/recent');
}

export function getCertificateRequest(id: number): Promise<CertificateRequest> {
  return httpClient.get<CertificateRequest>(`/certificate-requests/${id}`);
}

export async function createCertificateRequest(
  payload: CreateCertificateRequestPayload,
): Promise<CertificateRequest> {
  const formData = new FormData();
  formData.append('supplierId', String(payload.supplierId));
  formData.append('invoiceNumber', payload.invoiceNumber.trim());
  formData.append('invoiceDate', payload.invoiceDate);
  formData.append('expectedCertificates', String(payload.expectedCertificates));
  if (payload.notes?.trim()) {
    formData.append('notes', payload.notes.trim());
  }
  formData.append('invoiceFile', payload.invoiceFile);

  const response = await axios.post<CertificateRequest>(
    `${env.apiUrl}/certificate-requests`,
    formData,
    {
      withCredentials: true,
      headers: {
        'x-csrf-token': getWebCsrfToken() ?? '',
      },
    },
  );

  return response.data;
}

export async function registerSupplierContact(
  requestId: number,
): Promise<CertificateRequest> {
  const response = await axios.post<CertificateRequest>(
    `${env.apiUrl}/certificate-requests/${requestId}/supplier-contact`,
    {},
    {
      withCredentials: true,
      headers: {
        'x-csrf-token': getWebCsrfToken() ?? '',
      },
    },
  );

  return response.data;
}

export type AttachCertificatePayload = {
  certificateFile: File;
  lotLabel?: string;
};

export async function attachCertificate(
  requestId: number,
  payload: AttachCertificatePayload,
): Promise<CertificateRequest> {
  const formData = new FormData();
  formData.append('certificateFile', payload.certificateFile);
  if (payload.lotLabel?.trim()) {
    formData.append('lotLabel', payload.lotLabel.trim());
  }

  const response = await axios.post<CertificateRequest>(
    `${env.apiUrl}/certificate-requests/${requestId}/certificates`,
    formData,
    {
      withCredentials: true,
      headers: {
        'x-csrf-token': getWebCsrfToken() ?? '',
      },
    },
  );

  return response.data;
}

export async function completeCertificateRequest(
  requestId: number,
): Promise<CertificateRequest> {
  const response = await axios.post<CertificateRequest>(
    `${env.apiUrl}/certificate-requests/${requestId}/complete`,
    {},
    {
      withCredentials: true,
      headers: {
        'x-csrf-token': getWebCsrfToken() ?? '',
      },
    },
  );

  return response.data;
}

export async function cancelCertificateRequest(
  requestId: number,
): Promise<CertificateRequest> {
  const response = await axios.post<CertificateRequest>(
    `${env.apiUrl}/certificate-requests/${requestId}/cancel`,
    {},
    {
      withCredentials: true,
      headers: {
        'x-csrf-token': getWebCsrfToken() ?? '',
      },
    },
  );

  return response.data;
}
