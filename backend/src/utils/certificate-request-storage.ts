import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { AttachmentType } from '../generated/prisma/enums.js';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads', 'certificate-requests');

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp']);

function folderForType(type: AttachmentType): string {
  if (type === AttachmentType.NOTA_FISCAL) {
    return 'invoices';
  }

  if (type === AttachmentType.IMPRESSAO_CONFERENCIA) {
    return 'conference-prints';
  }

  return 'certificates';
}

export async function saveCertificateRequestFile(
  requestId: number,
  type: AttachmentType,
  buffer: Buffer,
  originalFilename: string,
): Promise<string> {
  const ext = path.extname(originalFilename).toLowerCase();
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '.pdf';
  const targetDir = path.join(
    UPLOADS_ROOT,
    String(requestId),
    folderForType(type),
  );

  await mkdir(targetDir, { recursive: true });

  const storedName = `${randomUUID()}${safeExt}`;
  const absolutePath = path.join(targetDir, storedName);
  await writeFile(absolutePath, buffer);

  return `/uploads/certificate-requests/${requestId}/${folderForType(type)}/${storedName}`;
}
