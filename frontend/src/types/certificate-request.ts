export type CertificateRequestStatus =
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
  dimensionalSpecified: string;
  dimensionalFound: string;
  visualInspection: InspectionCheckResult;
  reportStatus: InspectionCheckResult;
  receiverResponsible: string;
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
};

export type CertificateRequest = {
  id: number;
  supplier: {
    id: number;
    name: string;
    cnpj: string;
  };
  invoiceNumber: string;
  invoiceDate: string;
  expectedCertificates: number;
  notes: string | null;
  status: CertificateRequestStatus;
  createdByUserId: number;
  createdByName: string | null;
  submittedAt: string;
  supplierContactAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  attachments?: RequestAttachment[];
  historyEvents?: RequestHistoryEvent[];
  attachedCertificatesCount?: number;
};

export type CreateCertificateRequestPayload = {
  supplierId: number;
  invoiceNumber: string;
  invoiceDate: string;
  expectedCertificates: number;
  notes?: string;
  invoiceFile?: File;
};
