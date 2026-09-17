import type {
  RequestAttachment,
  RequestHistoryEvent,
} from '@/types/certificate-request';

export function buildHistoryEventAttachmentMap(
  events: RequestHistoryEvent[],
  attachments: RequestAttachment[],
): Map<string, RequestAttachment> {
  const map = new Map<string, RequestAttachment>();

  const certificateEvents = events
    .filter((event) => event.eventType === 'CERTIFICADO_ANEXADO')
    .sort(
      (left, right) =>
        new Date(left.occurredAt).getTime() -
        new Date(right.occurredAt).getTime(),
    );

  const certificateAttachments = attachments
    .filter((attachment) => attachment.type === 'CERTIFICADO')
    .sort(
      (left, right) =>
        new Date(left.uploadedAt).getTime() -
        new Date(right.uploadedAt).getTime(),
    );

  certificateEvents.forEach((event, index) => {
    const attachment = certificateAttachments[index];
    if (attachment) {
      map.set(event.id, attachment);
    }
  });

  const invoiceAttachment = attachments.find(
    (attachment) => attachment.type === 'NOTA_FISCAL',
  );
  const createdEvent = events.find(
    (event) => event.eventType === 'SOLICITACAO_CRIADA',
  );

  if (createdEvent && invoiceAttachment) {
    map.set(createdEvent.id, invoiceAttachment);
  }

  return map;
}
