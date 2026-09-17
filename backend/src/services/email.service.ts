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
  recipients: string[];
};

export type EmailDispatchResult = {
  sent: boolean;
  recipients: string[];
};

export async function sendNewCertificateRequestEmail(
  params: NewRequestEmailParams,
): Promise<EmailDispatchResult> {
  const recipients = [
    ...new Set(
      params.recipients
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];

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

  if (recipients.length === 0) {
    console.info(
      '[email:skipped] Nenhum operador de compras com e-mail cadastrado.',
    );
    console.info(subject);
    console.info(body);
    return { sent: false, recipients: [] };
  }

  for (const recipient of recipients) {
    console.info(`[email:queued] Para ${recipient}`);
    console.info(subject);
    console.info(body);
  }

  return { sent: true, recipients };
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

export function resolvePurchaseNotificationRecipients(
  operatorEmails: string[],
  fallbackEmail = env.EMAIL_COMPRAS,
): string[] {
  const recipients = operatorEmails
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (fallbackEmail?.trim()) {
    recipients.push(fallbackEmail.trim().toLowerCase());
  }

  return [...new Set(recipients)];
}
