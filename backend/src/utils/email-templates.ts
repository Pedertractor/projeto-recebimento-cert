import { formatCnpj } from './cnpj.js';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDatePtBr(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) {
    return isoDate;
  }

  return `${day}/${month}/${year}`;
}

function formatDateTimePtBr(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return isoDateTime;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function renderEmailLayout(params: {
  title: string;
  introHtml: string;
  listItemsHtml: string;
  actionHtml: string;
  buttonLabel: string;
  link: string;
  footerHtml: string;
}): string {
  const safeLink = escapeHtml(params.link);

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
      <h2 style="margin: 0 0 12px;">${escapeHtml(params.title)}</h2>
      ${params.introHtml}
      <ul>
        ${params.listItemsHtml}
      </ul>
      ${params.actionHtml}
      <p style="margin: 24px 0;">
        <a
          href="${safeLink}"
          style="display:inline-block;padding:12px 18px;background:#4f5f52;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;"
        >
          ${escapeHtml(params.buttonLabel)}
        </a>
      </p>
      <p style="font-size: 12px; color: #6b7280;">
        Se o botão não funcionar, use o link:<br />
        <a href="${safeLink}">${safeLink}</a>
      </p>
      <p style="font-size: 12px; color: #6b7280;">
        ${params.footerHtml}
      </p>
    </div>
  `.trim();
}

function renderListItem(label: string, value: string): string {
  return `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</li>`;
}

export type NewCertificateRequestEmailContent = {
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
};

export function buildNewCertificateRequestEmail(
  params: NewCertificateRequestEmailContent,
): { subject: string; html: string; text: string } {
  const subject = `[Solicitação Certificado] NF ${params.invoiceNumber} — ${params.supplierName}`;
  const formattedCnpj = formatCnpj(params.supplierCnpj);
  const formattedInvoiceDate = formatDatePtBr(params.invoiceDate);
  const formattedSubmittedAt = formatDateTimePtBr(params.submittedAt);
  const lotLabel =
    params.expectedCertificates === 1 ? '1 lote' : `${params.expectedCertificates} lotes`;

  const listItems = [
    renderListItem('Fornecedor', params.supplierName),
    renderListItem('CNPJ', formattedCnpj),
    renderListItem('Número da NF', params.invoiceNumber),
    renderListItem('Data da NF', formattedInvoiceDate),
    renderListItem('Lotes na NF', lotLabel),
    params.createdByName?.trim()
      ? renderListItem('Solicitante (estoque)', params.createdByName.trim())
      : '',
    params.notes?.trim()
      ? renderListItem('Observações', params.notes.trim())
      : '',
  ]
    .filter(Boolean)
    .join('\n        ');

  const introHtml = `
      <p>
        O estoque abriu uma nova solicitação de certificado de qualidade no sistema
        <strong>Certificado de Qualidade</strong>.
      </p>
  `.trim();

  const actionHtml = `
      <p>
        Entre em contato com o fornecedor e acesse o link abaixo para registrar o envio
        e anexar os certificados.
      </p>
  `.trim();

  const footerHtml = `Solicitação #${params.requestId} · Aberta em ${escapeHtml(formattedSubmittedAt)}`;

  const html = renderEmailLayout({
    title: 'Nova solicitação — Certificado de Qualidade',
    introHtml,
    listItemsHtml: listItems,
    actionHtml,
    buttonLabel: 'Abrir solicitação',
    link: params.magicLinkUrl,
    footerHtml,
  });

  const text = [
    'Nova solicitação — Certificado de Qualidade',
    '',
    'O estoque abriu uma nova solicitação de certificado de qualidade.',
    '',
    `Fornecedor: ${params.supplierName}`,
    `CNPJ: ${formattedCnpj}`,
    `Número da NF: ${params.invoiceNumber}`,
    `Data da NF: ${formattedInvoiceDate}`,
    `Lotes na NF: ${lotLabel}`,
    params.createdByName?.trim()
      ? `Solicitante (estoque): ${params.createdByName.trim()}`
      : null,
    params.notes?.trim() ? `Observações: ${params.notes.trim()}` : null,
    '',
    'Entre em contato com o fornecedor e acesse o link abaixo para registrar o envio e anexar os certificados.',
    '',
    'Abrir solicitação:',
    params.magicLinkUrl,
    '',
    `Solicitação #${params.requestId} · Aberta em ${formattedSubmittedAt}`,
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}

export type CompletedCertificateRequestEmailContent = {
  requestId: number;
  supplierName: string;
  invoiceNumber: string;
  attachedCertificatesCount: number;
  stockOperatorName: string | null;
  completedAt: string;
  requestUrl: string;
};

export function buildCompletedCertificateRequestEmail(
  params: CompletedCertificateRequestEmailContent,
): { subject: string; html: string; text: string } {
  const subject = `[Certificados recebidos] Solicitação #${params.requestId} — ${params.supplierName}`;
  const formattedCompletedAt = formatDateTimePtBr(params.completedAt);
  const certificatesLabel =
    params.attachedCertificatesCount === 1
      ? '1 certificado'
      : `${params.attachedCertificatesCount} certificados`;
  const name = params.stockOperatorName?.trim() || 'colaborador';

  const listItems = [
    renderListItem('Fornecedor', params.supplierName),
    renderListItem('Número da NF', params.invoiceNumber),
    renderListItem('Certificados anexados', certificatesLabel),
  ].join('\n        ');

  const introHtml = `
      <p>Olá, <strong>${escapeHtml(name)}</strong>.</p>
      <p>
        A solicitação foi concluída pelo Compras e os certificados já estão disponíveis no sistema
        <strong>Certificado de Qualidade</strong>.
      </p>
  `.trim();

  const actionHtml = `
      <p>
        Acesse o link abaixo para visualizar os certificados anexados.
      </p>
  `.trim();

  const footerHtml = `Solicitação #${params.requestId} · Concluída em ${escapeHtml(formattedCompletedAt)}`;

  const html = renderEmailLayout({
    title: 'Certificados recebidos — Certificado de Qualidade',
    introHtml,
    listItemsHtml: listItems,
    actionHtml,
    buttonLabel: 'Visualizar certificados',
    link: params.requestUrl,
    footerHtml,
  });

  const text = [
    'Certificados recebidos — Certificado de Qualidade',
    '',
    `Olá, ${name}.`,
    '',
    'A solicitação foi concluída pelo Compras e os certificados já estão disponíveis no sistema.',
    '',
    `Fornecedor: ${params.supplierName}`,
    `Número da NF: ${params.invoiceNumber}`,
    `Certificados anexados: ${certificatesLabel}`,
    '',
    'Visualizar certificados:',
    params.requestUrl,
    '',
    `Solicitação #${params.requestId} · Concluída em ${formattedCompletedAt}`,
  ].join('\n');

  return { subject, html, text };
}
