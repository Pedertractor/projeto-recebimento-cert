export function isPdfFile(fileName: string): boolean {
  return /\.pdf$/i.test(fileName);
}

export function isImageFile(fileName: string): boolean {
  return /\.(png|jpe?g|webp)$/i.test(fileName);
}
