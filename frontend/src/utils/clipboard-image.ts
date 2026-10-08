export async function readImageFileFromClipboard(
  data: DataTransfer,
): Promise<File | null> {
  const items = Array.from(data.items);

  for (const item of items) {
    if (!item.type.startsWith('image/')) {
      continue;
    }

    const blob = item.getAsFile();
    if (!blob) {
      continue;
    }

    const extension = blob.type.split('/')[1] || 'png';
    return new File([blob], `print-${Date.now()}.${extension}`, {
      type: blob.type,
    });
  }

  return null;
}

export async function readImageFileFromClipboardApi(): Promise<File | null> {
  if (!navigator.clipboard?.read) {
    return null;
  }

  const items = await navigator.clipboard.read();

  for (const item of items) {
    for (const type of item.types) {
      if (!type.startsWith('image/')) {
        continue;
      }

      const blob = await item.getType(type);
      const extension = type.split('/')[1] || 'png';
      return new File([blob], `print-${Date.now()}.${extension}`, { type });
    }
  }

  return null;
}
