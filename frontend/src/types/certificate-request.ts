import type { ProductType } from '@/types/product-type';
import type { QualityDocument } from '@/types/quality-document';

export type CertificateRequestStatus =
  | 'CADASTRADA'
  | 'AGUARDANDO_COMPRAS'
  | 'AGUARDANDO_FORNECEDOR'
  | 'CONCLUIDA'
  | 'CANCELADA';

export type AttachmentType =
  | 'NOTA_FISCAL'
  | 'CERTIFICADO'
  | 'IMPRESSAO_CONFERENCIA';

export type AttachmentValidity = 'VALID' | 'INVALID';

export type InspectionCheckResult = 'OK' | 'NOK';

export type CertificateInspection = {
  id: string;
  attachmentId: string;
  requestId: number;
  qualityDocumentId: string;
  qualityDocumentName: string;
  receiptDate: string;
  materialDescription: string;
  rm: string;
  certificateNumber: string;
  chemicalComposition: InspectionCheckResult;
  quantitySpecified: string;
  quantityFound: string;
  dimensionalSpecifiedThickness: string;
  dimensionalSpecifiedWidth: string;
  dimensionalSpecifiedLength: string;
  dimensionalFoundThickness: string;
  dimensionalFoundWidth: string;
  dimensionalFoundLength: string;
  visualInspection: InspectionCheckResult;
  reportStatus: InspectionCheckResult;
  receiverResponsible: string;
  receiverEmployeeId?: number | null;
  inspectedByUserId: number;
  inspectedAt: string;
  isValid: boolean;
};

export type RequestAttachment = {
  id: string;
  type: AttachmentType;
  fileName: string;
  storagePath: string;
  lotLabel: string | null;
  lotIndex: number | null;
  validity: AttachmentValidity;
  uploadedAt: string;
  inspection?: CertificateInspection | null;
};

export type RequestHistoryEvent = {
  id: string;
  eventType: string;
  description: string | null;
  occurredAt: string;
  actorName?: string | null;
};

export type CertificateRequest = {
  id: number;
  supplier: {
    id: number;
    name: string;
    cnpj: string;
    logoStoragePath: string | null;
  };
  invoiceNumber: string;
  invoiceDate: string;
  expectedCertificates: number;
  productTypeId: number;
  productType: ProductType;
  notes: string | null;
  status: CertificateRequestStatus;
  createdByUserId: number;
  createdByName: string | null;
  submittedAt: string;
  supplierContactAt: string | null;
  completedAt: string | null;
  hasUnseenPurchaseCertificate?: boolean;
  createdAt: string;
  updatedAt: string;
  attachments?: RequestAttachment[];
  historyEvents?: RequestHistoryEvent[];
  attachedCertificatesCount?: number;
  inspectedCertificatesCount?: number;
  qualityDocumentId?: string | null;
  qualityDocumentLocked?: boolean;
  qualityDocument?: QualityDocument | null;
};

export type CreateCertificateRequestPayload = {
  supplierId: number;
  invoiceNumber: string;
  invoiceDate: string;
  expectedCertificates: number;
  productTypeId: number;
  notes?: string;
  invoiceFile?: File;
};

export type UpdateCertificateRequestPayload = {
  supplierId?: number;
  invoiceNumber?: string;
  invoiceDate?: string;
  expectedCertificates?: number;
  productTypeId?: number;
  notes?: string;
};
