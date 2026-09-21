import { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Expand,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  copyPdfPageToClipboard,
  loadPdfDocument,
  PDF_PREVIEW_RENDER_SCALE,
  renderPdfPageToBlob,
} from '@/utils/pdf-page-image';
import { cn } from '@/lib/utils';

type PdfPageViewerProps = {
  pdfUrl: string;
  className?: string;
  initialPage?: number;
  onPageChange?: (pageNumber: number) => void;
  showCopyButton?: boolean;
  showExpandButton?: boolean;
  expandDialogTitle?: string;
  compact?: boolean;
};

export function PdfPageViewer({
  pdfUrl,
  className,
  initialPage = 1,
  onPageChange,
  showCopyButton = false,
  showExpandButton = true,
  expandDialogTitle = 'Visualizar página',
  compact = false,
}: PdfPageViewerProps) {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [expandOpen, setExpandOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previewUrlRef = useRef<string | null>(null);
  const onPageChangeRef = useRef(onPageChange);

  useEffect(() => {
    onPageChangeRef.current = onPageChange;
  }, [onPageChange]);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    setPageNumber(initialPage);
  }, [initialPage, pdfUrl]);

  useEffect(() => {
    let cancelled = false;

    async function loadDocument() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const loadedDocument = await loadPdfDocument(pdfUrl);
        if (cancelled) {
          return;
        }

        setDocument(loadedDocument);
        setTotalPages(loadedDocument.numPages);
        setPageNumber((currentPage) =>
          Math.min(Math.max(currentPage, 1), loadedDocument.numPages),
        );
      } catch {
        if (!cancelled) {
          setErrorMessage('Não foi possível carregar o PDF.');
          setDocument(null);
          setTotalPages(0);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDocument();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (!document || totalPages === 0) {
      return;
    }

    let cancelled = false;

    async function renderPage() {
      setIsRendering(true);

      try {
        const blob = await renderPdfPageToBlob(
          document!,
          pageNumber,
          PDF_PREVIEW_RENDER_SCALE,
        );
        if (cancelled) {
          return;
        }

        const nextUrl = URL.createObjectURL(blob);
        setPreviewUrl((currentUrl) => {
          if (currentUrl) {
            URL.revokeObjectURL(currentUrl);
          }
          return nextUrl;
        });
        onPageChangeRef.current?.(pageNumber);
      } catch {
        if (!cancelled) {
          setErrorMessage('Não foi possível exibir esta página.');
        }
      } finally {
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    }

    void renderPage();

    return () => {
      cancelled = true;
    };
  }, [document, pageNumber, totalPages]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function goToPage(nextPage: number): void {
    if (totalPages === 0) {
      return;
    }

    setPageNumber(Math.min(Math.max(nextPage, 1), totalPages));
  }

  async function handleCopyPage(): Promise<void> {
    if (!document) {
      return;
    }

    setIsCopying(true);

    try {
      await copyPdfPageToClipboard(document, pageNumber);
      toast.success(`Página ${pageNumber} copiada. Cole no lote com Ctrl+V.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível copiar a página.';
      toast.error(message);
    } finally {
      setIsCopying(false);
    }
  }

  const showInitialLoader = isLoading && !previewUrl;

  return (
    <>
      <div className={cn('flex min-h-0 flex-1 flex-col gap-3', className)}>
        <div
          className={cn(
            'relative min-h-0 flex-1 overflow-hidden rounded-xl bg-muted/30 ring-1 ring-border/50',
            compact ? 'min-h-48' : 'min-h-56',
          )}
        >
          {showInitialLoader ? (
            <div className="flex size-full items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : errorMessage && !previewUrl ? (
            <div className="flex size-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
              {errorMessage}
            </div>
          ) : previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt={`Página ${pageNumber}`}
                className={cn(
                  'size-full object-contain transition-opacity duration-150',
                  isRendering && 'opacity-70',
                )}
              />
              {isRendering ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/10">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : null}
              {totalPages > 0 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="absolute top-1/2 left-2 z-10 -translate-y-1/2 bg-background/90 shadow-sm"
                    disabled={pageNumber <= 1}
                    aria-label="Página anterior"
                    onClick={() => goToPage(pageNumber - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="absolute top-1/2 right-2 z-10 -translate-y-1/2 bg-background/90 shadow-sm"
                    disabled={pageNumber >= totalPages}
                    aria-label="Próxima página"
                    onClick={() => goToPage(pageNumber + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </>
              ) : null}
            </>
          ) : null}
        </div>

        {totalPages > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={pageNumber <= 1}
              onClick={() => goToPage(pageNumber - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-24 text-center text-xs text-muted-foreground">
              Página {pageNumber} de {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={pageNumber >= totalPages}
              onClick={() => goToPage(pageNumber + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
            {showExpandButton ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!previewUrl}
                onClick={() => setExpandOpen(true)}
              >
                <Expand className="size-4" />
                Ampliar
              </Button>
            ) : null}
            {showCopyButton ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={showExpandButton ? undefined : 'ml-auto'}
                disabled={isCopying || !previewUrl}
                onClick={() => void handleCopyPage()}
              >
                {isCopying ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Copy className="size-4" />
                )}
                Copiar página
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <Dialog open={expandOpen} onOpenChange={setExpandOpen}>
        <DialogContent className="flex max-h-[92vh] w-[min(96vw,56rem)] max-w-[min(96vw,56rem)] flex-col gap-4 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {expandDialogTitle} {totalPages > 0 ? `(${pageNumber}/${totalPages})` : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="relative min-h-[50vh] flex-1 overflow-hidden rounded-xl bg-muted/30 ring-1 ring-border/50">
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt={`Página ${pageNumber} ampliada`}
                  className={cn(
                    'max-h-[72vh] w-full object-contain transition-opacity duration-150',
                    isRendering && 'opacity-70',
                  )}
                />
                {isRendering ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/10">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex size-full min-h-[50vh] items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {totalPages > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={pageNumber <= 1}
                onClick={() => goToPage(pageNumber - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="min-w-28 text-center text-sm text-muted-foreground">
                Página {pageNumber} de {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={pageNumber >= totalPages}
                onClick={() => goToPage(pageNumber + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
              {showCopyButton ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isCopying || !previewUrl}
                  onClick={() => void handleCopyPage()}
                >
                  {isCopying ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  Copiar página
                </Button>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
