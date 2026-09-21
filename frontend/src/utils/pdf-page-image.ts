import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentProxy,
} from 'pdfjs-dist';

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

/** Preview in the viewer — lighter for navigation. */
export const PDF_PREVIEW_RENDER_SCALE = 1.5;

/** Copy/import for conference — higher resolution for zoom during inspection. */
export const CONFERENCE_PRINT_RENDER_SCALE = 2;

let workerConfigured = false;

function configurePdfWorker(): void {
  if (workerConfigured) {
    return;
  }

  GlobalWorkerOptions.workerSrc = pdfWorker;
  workerConfigured = true;
}

export async function loadPdfDocument(url: string): Promise<PDFDocumentProxy> {
  configurePdfWorker();

  const loadingTask = getDocument({ url });
  return loadingTask.promise;
}

export async function renderPdfPageToCanvas(
  document: PDFDocumentProxy,
  pageNumber: number,
  scale = PDF_PREVIEW_RENDER_SCALE,
): Promise<HTMLCanvasElement> {
  const page = await document.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = window.document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Não foi possível renderizar a página do PDF.');
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvas,
    canvasContext: context,
    viewport,
  }).promise;

  return canvas;
}

export async function renderPdfPageToBlob(
  document: PDFDocumentProxy,
  pageNumber: number,
  scale = PDF_PREVIEW_RENDER_SCALE,
): Promise<Blob> {
  const canvas = await renderPdfPageToCanvas(document, pageNumber, scale);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Não foi possível gerar a imagem da página.'));
        return;
      }

      resolve(blob);
    }, 'image/png');
  });
}

export async function renderPdfPageToFile(
  document: PDFDocumentProxy,
  pageNumber: number,
  fileName: string,
  scale = CONFERENCE_PRINT_RENDER_SCALE,
): Promise<File> {
  const blob = await renderPdfPageToBlob(document, pageNumber, scale);
  return new File([blob], fileName, { type: 'image/png' });
}

export async function copyPdfPageToClipboard(
  document: PDFDocumentProxy,
  pageNumber: number,
  scale = CONFERENCE_PRINT_RENDER_SCALE,
): Promise<void> {
  const blob = await renderPdfPageToBlob(document, pageNumber, scale);

  if (!navigator.clipboard?.write) {
    throw new Error('Seu navegador não suporta copiar imagens para a área de transferência.');
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blob,
    }),
  ]);
}
