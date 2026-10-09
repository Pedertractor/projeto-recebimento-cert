import { resolveUploadUrl } from '@/lib/resolve-upload-url';

export function resolveAttachmentUrl(storagePath: string): string {
  return resolveUploadUrl(storagePath) ?? storagePath;
}

export function canPreviewAttachment(fileName: string): boolean {
  return /\.(pdf|png|jpe?g|webp)$/i.test(fileName);
}
