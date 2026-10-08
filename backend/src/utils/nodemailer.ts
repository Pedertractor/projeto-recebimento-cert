import nodemailer from 'nodemailer';

import { env } from '../config/env.js';

export function isMailConfigured(): boolean {
  return Boolean(
    env.CORREIO?.trim() &&
      env.EMAIL_AUTOMACAO?.trim() &&
      env.PASSWORD_AUTOMACAO?.trim(),
  );
}

type MailTransporter = ReturnType<typeof nodemailer.createTransport>;

let mailTransporter: MailTransporter | null = null;

function getMailTransporter(): MailTransporter {
  if (!mailTransporter) {
    mailTransporter = nodemailer.createTransport({
      host: env.CORREIO,
      port: env.PORT_CORREIO,
      auth: {
        user: env.EMAIL_AUTOMACAO,
        pass: env.PASSWORD_AUTOMACAO,
      },
      pool: true,
      maxConnections: 1,
      maxMessages: 100,
    });
  }

  return mailTransporter;
}

export async function sendEmailByNodeMailer(
  to: string | string[],
  subject: string,
  html: string,
  text?: string,
) {
  if (!isMailConfigured()) {
    throw new Error(
      'Credenciais de e-mail incompletas (CORREIO, EMAIL_AUTOMACAO, PASSWORD_AUTOMACAO).',
    );
  }

  const recipients = [...new Set(
    (Array.isArray(to) ? to : [to])
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )];

  if (recipients.length === 0) {
    throw new Error('Nenhum destinatário informado.');
  }

  return getMailTransporter().sendMail({
    from: `"Confere NF" <${env.EMAIL_AUTOMACAO}>`,
    to: recipients,
    subject,
    html,
    text,
  });
}
