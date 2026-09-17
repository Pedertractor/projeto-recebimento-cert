import axios from 'axios';

import { env } from '@/config/env';
import { getWebCsrfToken, httpClient } from '@/lib/http-client';
import type {
  CreateQualityDocumentPayload,
  QualityDocument,
} from '@/types/quality-document';

export const qualityDocumentsListQueryKey = ['quality-documents'] as const;

export function listQualityDocuments(): Promise<QualityDocument[]> {
  return httpClient.get<QualityDocument[]>('/quality-documents');
}

export async function createQualityDocument(
  payload: CreateQualityDocumentPayload,
): Promise<QualityDocument> {
  const formData = new FormData();
  formData.append('year', String(payload.year));
  formData.append('documentFile', payload.documentFile);

  const response = await axios.post<QualityDocument>(
    `${env.apiUrl}/quality-documents`,
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

export function getNextVersionPreview(
  documents: QualityDocument[],
  year: number,
): string {
  const latestForYear = documents
    .filter((document) => document.year === year)
    .reduce<QualityDocument | null>((latest, document) => {
      if (!latest || document.versionNumber > latest.versionNumber) {
        return document;
      }
      return latest;
    }, null);

  const nextVersion = (latestForYear?.versionNumber ?? 0) + 1;
  return `DOC QUALIDADE ${year} v${nextVersion}`;
}
