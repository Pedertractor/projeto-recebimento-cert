/**
 * Monta a URL de arquivos em `/uploads/` servidos pelo backend.
 * Em dev (e no Docker com nginx), usa caminho relativo para o proxy repassar.
 */
export function resolveUploadUrl(imagePath: string | null): string | null {
  if (!imagePath) {
    return null;
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  if (!imagePath.startsWith('/uploads/')) {
    return imagePath;
  }

  if (import.meta.env.DEV) {
    return imagePath;
  }

  const configured = import.meta.env.VITE_API_URL?.trim();
  if (!configured || configured === '/api') {
    return imagePath;
  }

  const origin = configured.replace(/\/api\/?$/, '');
  return `${origin}${imagePath}`;
}
