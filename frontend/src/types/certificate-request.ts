export type CertificateRequestStatus =
  | 'AGUARDANDO_COMPRAS'
  | 'AGUARDANDO_FORNECEDOR'
  | 'CONCLUIDA'
  | 'CANCELADA';

export type AttachmentType = 'NOTA_FISCAL' | 'CERTIFICADO';

export type RequestAttachment = {
  id: string;
  type: AttachmentType;
  fileName: string;
  storagePath: string;
  lotLabel: string | null;
  uploadedAt: string;
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
  invoiceFile: File;
};
