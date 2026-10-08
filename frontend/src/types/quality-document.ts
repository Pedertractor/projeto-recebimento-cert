export type QualityDocument = {
  id: string;
  year: number;
  versionNumber: number;
  displayName: string;
  fileName: string;
  storagePath: string;
  uploadedByUserId: number;
  uploadedByName: string | null;
  createdAt: string;
};

export type CreateQualityDocumentPayload = {
  year: number;
  documentFile: File;
};
