export type QualityDocument = {
  id: string;
  productTypeId: number;
  productTypeName: string;
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
  productTypeId: number;
  year: number;
  documentFile: File;
};
