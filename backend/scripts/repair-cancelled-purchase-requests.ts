import { prisma } from '../src/config/prisma.js';
import {
  AttachmentType,
  CertificateRequestStatus,
  RequestHistoryEventType,
} from '../src/generated/prisma/enums.js';

async function main() {
  const candidates = await prisma.certificateRequest.findMany({
    where: {
      status: CertificateRequestStatus.CANCELADA,
      historyEvents: {
        some: {
          eventType: RequestHistoryEventType.EMAIL_COMPRAS_ENVIADO,
        },
      },
    },
    include: {
      attachments: { select: { type: true } },
      historyEvents: { select: { eventType: true } },
    },
  });

  const repairedIds: number[] = [];

  for (const request of candidates) {
    const hasCertificate = request.attachments.some(
      (attachment) => attachment.type === AttachmentType.CERTIFICADO,
    );
    const supplierContacted = request.historyEvents.some(
      (event) =>
        event.eventType === RequestHistoryEventType.ENVIO_FORNECEDOR_REGISTRADO,
    );
    const completed = request.historyEvents.some(
      (event) =>
        event.eventType === RequestHistoryEventType.SOLICITACAO_CONCLUIDA,
    );

    if (hasCertificate || supplierContacted || completed) {
      continue;
    }

    await prisma.certificateRequest.update({
      where: { id: request.id },
      data: { status: CertificateRequestStatus.CADASTRADA },
    });

    repairedIds.push(request.id);
  }

  console.log(
    repairedIds.length > 0
      ? `Repaired requests: ${repairedIds.join(', ')}`
      : 'No requests needed repair.',
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
