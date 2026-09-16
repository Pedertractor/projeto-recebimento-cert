import { env } from '../config/env.js';

type NewRequestEmailParams = {
  requestId: number;
  supplierName: string;
  supplierCnpj: string;
  invoiceNumber: string;
  invoiceDate: string;
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
