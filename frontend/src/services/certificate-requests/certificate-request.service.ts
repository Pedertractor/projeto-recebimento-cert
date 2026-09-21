import axios from 'axios';
import { env } from '@/config/env';
import { getWebCsrfToken, httpClient } from '@/lib/http-client';
import { fileToBase64 } from '@/utils/file-to-base64';
import type {
  CertificateInspection,
  CertificateRequest,
  CreateCertificateRequestPayload,
  UpdateCertificateRequestPayload,
} from '@/types/certificate-request';
import type { CertificateComparisonFormValues } from '@/schemas/certificate-comparison.schema';

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

export const completedCertificateRequestsQueryKey = [
  'certificate-requests',
  'completed',
] as const;

export function certificateRequestDetailQueryKey(id: number) {
  return ['certificate-requests', id] as const;
}

export function listCertificateRequests(): Promise<CertificateRequest[]> {
  return httpClient.get<CertificateRequest[]>('/certificate-requests');
}

export function listPurchaseCertificateRequests(): Promise<
  CertificateRequest[]
> {
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

export function listCompletedCertificateRequests(): Promise<
  CertificateRequest[]
> {
  return httpClient.get<CertificateRequest[]>(
    '/certificate-requests/completed',
  );
}

export function getCertificateRequest(id: number): Promise<CertificateRequest> {
  return httpClient.get<CertificateRequest>(`/certificate-requests/${id}`);
}

export function updateCertificateRequest(
  requestId: number,
  payload: UpdateCertificateRequestPayload,
): Promise<CertificateRequest> {
  return httpClient.patch<CertificateRequest, UpdateCertificateRequestPayload>(
    `/certificate-requests/${requestId}`,
    payload,
  );
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
  if (payload.invoiceFile) {
    formData.append('invoiceFile', payload.invoiceFile);
  }

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
  invoiceFile: File;
  lotLabel?: string;
};

export async function attachCertificate(
  requestId: number,
  payload: AttachCertificatePayload,
): Promise<CertificateRequest> {
  const formData = new FormData();
  formData.append('certificateFile', payload.certificateFile);
  formData.append('invoiceFile', payload.invoiceFile);
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

export async function requestDocumentFromPurchase(
  requestId: number,
): Promise<CertificateRequest> {
  const response = await axios.post<CertificateRequest>(
    `${env.apiUrl}/certificate-requests/${requestId}/request-document`,
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

export async function linkCertificatePdf(
  requestId: number,
  certificateFile: File,
): Promise<CertificateRequest> {
  const formData = new FormData();
  formData.append('certificateFile', certificateFile);

  const response = await axios.post<CertificateRequest>(
    `${env.apiUrl}/certificate-requests/${requestId}/link-certificate`,
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

export type AttachConferencePrintPayload = {
  lotIndex: number;
  printFile: File;
};

export async function attachConferencePrint(
  requestId: number,
  payload: AttachConferencePrintPayload,
): Promise<CertificateRequest> {
  if (payload.printFile.size === 0) {
    throw new Error('A imagem colada está vazia. Copie o print novamente.');
  }

  const imageBase64 = await fileToBase64(payload.printFile);

  return httpClient.post<CertificateRequest>(
    `/certificate-requests/${requestId}/conference-prints/paste`,
    {
      lotIndex: payload.lotIndex,
      imageBase64,
      mimeType: payload.printFile.type || 'image/png',
      fileName: payload.printFile.name || `lote-${payload.lotIndex}-print.png`,
    },
  );
}

export async function submitCertificateInspection(
  requestId: number,
  attachmentId: string,
  payload: CertificateComparisonFormValues,
): Promise<CertificateInspection> {
  return httpClient.post<CertificateInspection>(
    `/certificate-requests/${requestId}/attachments/${attachmentId}/inspection`,
    payload,
  );
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
