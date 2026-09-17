import { env } from '../config/env.js';

type NewRequestEmailParams = {
  requestId: number;
  supplierName: string;
  supplierCnpj: string;
  invoiceNumber: string;
  invoiceDate: string;
  expectedCertificates: number;
  notes?: string | null;
  magicLinkUrl: string;
};

export async function sendNewCertificateRequestEmail(
  params: NewRequestEmailParams,
): Promise<void> {
  const recipient = env.EMAIL_COMPRAS;
  const subject = `[Solicitação Certificado] NF ${params.invoiceNumber} — ${params.supplierName}`;
  const body = [
    'Nova solicitação de certificado de qualidade.',
    '',
    `Fornecedor: ${params.supplierName}`,
    `CNPJ: ${params.supplierCnpj}`,
    `Número da NF: ${params.invoiceNumber}`,
    `Data da NF: ${params.invoiceDate}`,
    `Lotes na NF: ${params.expectedCertificates}`,
    params.notes ? `Observações: ${params.notes}` : null,
    '',
    `Abrir solicitação: ${params.magicLinkUrl}`,
    '',
    `Solicitação #${params.requestId}`,
  ]
    .filter(Boolean)
    .join('\n');

  if (!recipient) {
    console.info('[email:skipped] EMAIL_COMPRAS não configurado.');
    console.info(subject);
    console.info(body);
    return;
  }

  console.info(`[email:queued] Para ${recipient}`);
  console.info(subject);
  console.info(body);
}

type CompletedRequestEmailParams = {
  requestId: number;
  supplierName: string;
  invoiceNumber: string;
  attachedCertificatesCount: number;
  stockOperatorName: string | null;
  stockOperatorEmail: string | null;
  requestUrl: string;
};

export async function sendCompletedCertificateRequestEmail(
  params: CompletedRequestEmailParams,
): Promise<void> {
  const recipient = params.stockOperatorEmail;
  const subject = `[Certificados recebidos] Solicitação #${params.requestId} — ${params.supplierName}`;
  const body = [
    'Os certificados da solicitação foram anexados e a solicitação foi concluída.',
    '',
    `Fornecedor: ${params.supplierName}`,
    `Número da NF: ${params.invoiceNumber}`,
    `Certificados anexados: ${params.attachedCertificatesCount}`,
    params.stockOperatorName
      ? `Solicitante: ${params.stockOperatorName}`
      : null,
    '',
    `Visualizar solicitação: ${params.requestUrl}`,
    '',
    `Solicitação #${params.requestId}`,
  ]
    .filter(Boolean)
    .join('\n');

  if (!recipient) {
    console.info('[email:skipped] E-mail do operador de estoque não configurado.');
    console.info(subject);
    console.info(body);
    return;
  }

  console.info(`[email:queued] Para ${recipient}`);
  console.info(subject);
  console.info(body);
}
