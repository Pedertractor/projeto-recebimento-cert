import { useState } from 'react';
import { FileImage, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { PdfPageViewer } from '@/components/conference/pdf-page-viewer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  loadPdfDocument,
  renderPdfPageToFile,
} from '@/utils/pdf-page-image';

type PdfPageImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string;
  fileName: string;
  lotIndex: number;
  defaultPage?: number;
  onImport: (file: File) => Promise<void>;
};

export function PdfPageImportDialog({
  open,
  onOpenChange,
  pdfUrl,
  fileName,
  lotIndex,
  defaultPage,
  onImport,
}: PdfPageImportDialogProps) {
  const [pageNumber, setPageNumber] = useState(defaultPage ?? lotIndex);
  const [isImporting, setIsImporting] = useState(false);

  async function handleImport(): Promise<void> {
    setIsImporting(true);

    try {
      const document = await loadPdfDocument(pdfUrl);
      const safePage = Math.min(Math.max(pageNumber, 1), document.numPages);
      const baseName = fileName.replace(/\.pdf$/i, '');
      const pageFile = await renderPdfPageToFile(
        document,
        safePage,
        `${baseName}-pagina-${safePage}-lote-${lotIndex}.png`,
      );

      await onImport(pageFile);
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível importar a página do PDF.';
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isImporting) {
          onOpenChange(nextOpen);
          if (nextOpen) {
            setPageNumber(defaultPage ?? lotIndex);
          }
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar página do PDF</DialogTitle>
          <DialogDescription>
            Selecione a página do certificado para usar como impressão do lote{' '}
            {lotIndex}.
          </DialogDescription>
        </DialogHeader>

        <PdfPageViewer
          pdfUrl={pdfUrl}
          initialPage={defaultPage ?? lotIndex}
          onPageChange={setPageNumber}
          showExpandButton={false}
          compact
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isImporting}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            disabled={isImporting}
            onClick={() => void handleImport()}
          >
            {isImporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileImage className="size-4" />
            )}
            Usar página {pageNumber} no lote {lotIndex}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
