import { format } from 'date-fns';

import {
  APP_LOGO_SRC,
  APP_NAME,
  COMPANY_NAME,
} from '@/components/brand-mark';
import {
  certificateRequestStatusLabel,
  formatRequestDate,
  getCertificateRequestRegisteredByName,
  getInspectedCertificatesCount,
  getNfConferenceStatus,
} from '@/lib/certificate-request-labels';
import type { CertificateRequest } from '@/types/certificate-request';

const TABLE_HEADERS = [
  'Solicitação',
  'Fornecedor',
  'Nº NF',
  'Lotes',
  'Comparados',
  'Data NF',
  'Status',
  'Cadastrado por',
  'Abertura',
] as const;

const HEADER_ROW = 5;
const DATA_START_ROW = HEADER_ROW + 1;
const LOGO_SIZE_PX = 48;
const LOGO_COLUMN_WIDTH = 12;
const LOGO_ROW_HEIGHT = 52;
const EMU_PER_PIXEL = 9525;

function columnWidthToPixels(width: number): number {
  return Math.trunc(((256 * width + Math.trunc(128 / 7)) / 256) * 7);
}

function rowHeightToPixels(heightPoints: number): number {
  return (heightPoints * 96) / 72;
}

export function listNfsEmConferenciaComComparacoesPendentes(
  requests: CertificateRequest[],
): CertificateRequest[] {
  return requests.filter(
    (request) => getNfConferenceStatus(request) === 'EM_CONFERENCIA',
  );
}

function downloadExcelBuffer(buffer: ArrayBuffer, fileName: string): void {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function loadAppLogoBuffer(): Promise<ArrayBuffer> {
  const response = await fetch(APP_LOGO_SRC);
  if (!response.ok) {
    throw new Error('Não foi possível carregar a logo do sistema.');
  }

  return response.arrayBuffer();
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]!);
  }

  return btoa(binary);
}

function buildDataRow(request: CertificateRequest): (string | number)[] {
  const status = getNfConferenceStatus(request);

  return [
    request.id,
    request.supplier.name,
    request.invoiceNumber,
    request.expectedCertificates,
    `${getInspectedCertificatesCount(request)}/${request.expectedCertificates}`,
    formatRequestDate(request.invoiceDate),
    certificateRequestStatusLabel(status),
    getCertificateRequestRegisteredByName(request),
    formatRequestDate(request.submittedAt),
  ];
}

export async function exportNfConferenceTableToExcel(
  requests: CertificateRequest[],
  fileName?: string,
): Promise<void> {
  const excelModule = (await import('exceljs')) as typeof import('exceljs') & {
    default?: typeof import('exceljs');
  };
  const ExcelJS = excelModule.default ?? excelModule;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = APP_NAME;
  const worksheet = workbook.addWorksheet('Em conferência');

  worksheet.getColumn(1).width = LOGO_COLUMN_WIDTH;
  worksheet.getColumn(2).width = 28;
  worksheet.getColumn(3).width = 14;
  worksheet.getColumn(4).width = 8;
  worksheet.getColumn(5).width = 12;
  worksheet.getColumn(6).width = 12;
  worksheet.getColumn(7).width = 16;
  worksheet.getColumn(8).width = 24;
  worksheet.getColumn(9).width = 12;

  worksheet.getRow(1).height = LOGO_ROW_HEIGHT;
  worksheet.getRow(2).height = 22;
  worksheet.getRow(3).height = 20;
  worksheet.getRow(4).height = 8;

  try {
    const logoBuffer = await loadAppLogoBuffer();
    const logoId = workbook.addImage({
      base64: arrayBufferToBase64(logoBuffer),
      extension: 'png',
    });

    const cellWidthPx = columnWidthToPixels(LOGO_COLUMN_WIDTH);
    const cellHeightPx = rowHeightToPixels(LOGO_ROW_HEIGHT);
    const offsetXPx = Math.max(0, (cellWidthPx - LOGO_SIZE_PX) / 2);
    const offsetYPx = Math.max(0, (cellHeightPx - LOGO_SIZE_PX) / 2);

    worksheet.addImage(logoId, {
      tl: {
        nativeCol: 0,
        nativeColOff: Math.round(offsetXPx * EMU_PER_PIXEL),
        nativeRow: 0,
        nativeRowOff: Math.round(offsetYPx * EMU_PER_PIXEL),
      },
      ext: { width: LOGO_SIZE_PX, height: LOGO_SIZE_PX },
    });
  } catch {
    worksheet.getCell('A1').value = APP_NAME.charAt(0);
    worksheet.getCell('A1').font = { bold: true, size: 20 };
  }

  worksheet.mergeCells('B1:I1');
  const titleCell = worksheet.getCell('B1');
  titleCell.value = APP_NAME;
  titleCell.font = { bold: true, size: 16, color: { argb: 'FF1F2937' } };
  titleCell.alignment = { vertical: 'middle' };

  worksheet.mergeCells('B2:I2');
  const companyCell = worksheet.getCell('B2');
  companyCell.value = COMPANY_NAME;
  companyCell.font = { bold: true, size: 12, color: { argb: 'FF374151' } };
  companyCell.alignment = { vertical: 'middle' };

  worksheet.mergeCells('B3:I3');
  const subtitleCell = worksheet.getCell('B3');
  subtitleCell.value = `NFs em conferência com comparações pendentes — ${format(new Date(), 'dd/MM/yyyy')}`;
  subtitleCell.font = { size: 11, color: { argb: 'FF6B7280' } };
  subtitleCell.alignment = { vertical: 'middle' };

  TABLE_HEADERS.forEach((header, index) => {
    const cell = worksheet.getCell(HEADER_ROW, index + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF1D4ED8' } },
      bottom: { style: 'thin', color: { argb: 'FF1D4ED8' } },
      left: { style: 'thin', color: { argb: 'FF1D4ED8' } },
      right: { style: 'thin', color: { argb: 'FF1D4ED8' } },
    };
  });

  worksheet.getRow(HEADER_ROW).height = 22;

  requests.forEach((request, rowIndex) => {
    const rowNumber = DATA_START_ROW + rowIndex;
    const values = buildDataRow(request);

    values.forEach((value, columnIndex) => {
      const cell = worksheet.getCell(rowNumber, columnIndex + 1);
      cell.value = value;
      cell.alignment = {
        vertical: 'middle',
        horizontal: columnIndex === 0 || columnIndex === 3 ? 'center' : 'left',
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };

      if (rowIndex % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' },
        };
      }
    });
  });

  worksheet.views = [{ state: 'frozen', ySplit: HEADER_ROW }];

  const buffer = await workbook.xlsx.writeBuffer();
  const resolvedFileName =
    fileName ??
    `nfs-em-conferencia-pendentes-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

  downloadExcelBuffer(buffer, resolvedFileName);
}
