import type {
  CertificateInspection,
  RequestAttachment,
} from '@/types/certificate-request';
import { formatRequestDate } from '@/lib/certificate-request-labels';

export type QualityManagementFormColumn = {
  lotIndex: number;
  lotLabel: string;
  supplierName: string;
  inspection: CertificateInspection | null;
};

export function getQualityManagementFormColumns(
  attachments: RequestAttachment[] | undefined,
  expectedCertificates: number,
  supplierName: string,
): QualityManagementFormColumn[] {
  return Array.from({ length: expectedCertificates }, (_, index) => {
    const lotIndex = index + 1;
    const printAttachment =
      attachments?.find(
        (attachment) =>
          attachment.type === 'IMPRESSAO_CONFERENCIA' &&
          attachment.lotIndex === lotIndex,
      ) ?? null;

    return {
      lotIndex,
      lotLabel: printAttachment?.lotLabel ?? `Lote ${lotIndex}`,
      supplierName,
      inspection: printAttachment?.inspection ?? null,
    };
  });
}

export function countCompletedInspections(
  columns: QualityManagementFormColumn[],
): number {
  return columns.filter((column) => column.inspection !== null).length;
}

export function formatInspectionOkNok(
  value: 'OK' | 'NOK' | null | undefined,
): string {
  if (!value) {
    return '—';
  }

  return value === 'OK' ? 'OK' : 'N.OK';
}

export function formatReportStatus(
  value: 'OK' | 'NOK' | null | undefined,
): string {
  if (!value) {
    return '—';
  }

  return value === 'OK' ? 'AP.' : 'REP.';
}

export function formatInspectionDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }

  return formatRequestDate(value);
}

export function getInspectionFieldValue(
  inspection: CertificateInspection | null,
  field:
    | 'receiptDate'
    | 'materialDescription'
    | 'rm'
    | 'certificateNumber'
    | 'quantitySpecified'
    | 'quantityFound'
    | 'dimensionalSpecified'
    | 'dimensionalFound'
    | 'receiverResponsible',
): string {
  if (!inspection) {
    return '—';
  }

  if (field === 'receiptDate') {
    return formatInspectionDate(inspection.receiptDate);
  }

  const value = inspection[field];
  return value?.trim() ? value : '—';
}
