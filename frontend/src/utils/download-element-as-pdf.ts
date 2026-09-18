import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

type DownloadElementAsPdfOptions = {
  fileName: string;
  scale?: number;
};

export async function downloadElementAsPdf(
  element: HTMLElement,
  { fileName, scale = 2 }: DownloadElementAsPdfOptions,
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait';

  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [canvas.width, canvas.height],
    compress: true,
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
  pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
}
