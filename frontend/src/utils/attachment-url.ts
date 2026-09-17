export function resolveAttachmentUrl(storagePath: string): string {
  return storagePath.startsWith('/') ? storagePath : `/${storagePath}`;
}

export function canPreviewAttachment(fileName: string): boolean {
  return /\.(pdf|png|jpe?g|webp)$/i.test(fileName);
}
