import { env } from '../config/env.js';
import {
  buildCompletedCertificateRequestEmail,
  buildNewCertificateRequestEmail,
} from '../utils/email-templates.js';
import { isMailConfigured, sendEmailByNodeMailer } from '../utils/nodemailer.js';

type NewRequestEmailParams = {
  requestId: number;
  supplierName: string;
  supplierCnpj: string;
  invoiceNumber: string;
  invoiceDate: string;
  expectedCertificates: number;
  notes?: string | null;
  createdByName?: string | null;
  submittedAt: string;
  magicLinkUrl: string;
  recipients: string[];
};

export type EmailDispatchResult = {
  sent: boolean;
  recipients: string[];
};

async function dispatchEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<boolean> {
  if (!isMailConfigured()) {
    console.info(`[email:skipped] SMTP não configurado. Para ${to}`);
    console.info(subject);
    console.info(text);
    return false;
  }

  await sendEmailByNodeMailer(to, subject, html, text);
  console.info(`[email:sent] Para ${to}`);
  return true;
}

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

  const { subject, html, text } = buildNewCertificateRequestEmail(params);

  if (recipients.length === 0) {
    console.info(
      '[email:skipped] Nenhum operador de compras com e-mail cadastrado.',
    );
    console.info(subject);
    console.info(text);
    return { sent: false, recipients: [] };
  }

  const deliveredRecipients: string[] = [];

  await Promise.all(
    recipients.map(async (recipient) => {
      try {
        const sent = await dispatchEmail(recipient, subject, html, text);
        if (sent) {
          deliveredRecipients.push(recipient);
        }
      } catch (error) {
        console.error(`[email:error] Para ${recipient}`, error);
      }
    }),
  );

  return {
    sent: deliveredRecipients.length > 0,
    recipients: deliveredRecipients,
  };
}

type CompletedRequestEmailParams = {
  requestId: number;
  supplierName: string;
  invoiceNumber: string;
  attachedCertificatesCount: number;
  stockOperatorName: string | null;
  stockOperatorEmail: string | null;
  completedAt: string;
  requestUrl: string;
};

export async function sendCompletedCertificateRequestEmail(
  params: CompletedRequestEmailParams,
): Promise<void> {
  const recipient = params.stockOperatorEmail?.trim().toLowerCase();
  const { subject, html, text } = buildCompletedCertificateRequestEmail(params);

  if (!recipient) {
    console.info('[email:skipped] E-mail do operador de estoque não configurado.');
    console.info(subject);
    console.info(text);
    return;
  }

  try {
    await dispatchEmail(recipient, subject, html, text);
  } catch (error) {
    console.error(`[email:error] Para ${recipient}`, error);
  }
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
