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
