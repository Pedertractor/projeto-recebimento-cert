import nodemailer from 'nodemailer';

import { env } from '../config/env.js';

export function isMailConfigured(): boolean {
  return Boolean(
    env.CORREIO?.trim() &&
      env.EMAIL_AUTOMACAO?.trim() &&
      env.PASSWORD_AUTOMACAO?.trim(),
  );
}

export async function sendEmailByNodeMailer(
  to: string,
  subject: string,
  html: string,
  text?: string,
) {
  if (!isMailConfigured()) {
    throw new Error(
      'Credenciais de e-mail incompletas (CORREIO, EMAIL_AUTOMACAO, PASSWORD_AUTOMACAO).',
    );
  }

  const transporter = nodemailer.createTransport({
    host: env.CORREIO,
    port: env.PORT_CORREIO,
    auth: {
      user: env.EMAIL_AUTOMACAO,
      pass: env.PASSWORD_AUTOMACAO,
    },
  });

  return transporter.sendMail({
    from: `"Confere NF" <${env.EMAIL_AUTOMACAO}>`,
    to,
    subject,
    html,
    text,
  });
}
