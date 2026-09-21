import { useEffect, useRef, useState, type ClipboardEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardCheck,
  ClipboardPaste,
  FileImage,
  FileUp,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { PdfPageImportDialog } from '@/components/conference/pdf-page-import-dialog';
import { Button } from '@/components/ui/button';
import { HttpClientError } from '@/lib/http-client';
import {
  attachConferencePrint,
  certificateRequestDetailQueryKey,
} from '@/services/certificate-requests/certificate-request.service';
import {
  readImageFileFromClipboard,
  readImageFileFromClipboardApi,
} from '@/utils/clipboard-image';
import { resolveAttachmentUrl } from '@/utils/attachment-url';
import { isImageFile, isPdfFile } from '@/utils/file-type';
import type { RequestAttachment } from '@/types/certificate-request';
import { cn } from '@/lib/utils';

type LotConferenceCardProps = {
  requestId: number;
  lotIndex: number;
  printAttachment: RequestAttachment | null;
  purchaseCertificate: RequestAttachment | null;
};

export function LotConferenceCard({
  requestId,
  lotIndex,
  printAttachment,
  purchaseCertificate,
}: LotConferenceCardProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPasteFocused, setIsPasteFocused] = useState(false);
  const [pdfImportOpen, setPdfImportOpen] = useState(false);

  const canImportFromPdf =
    purchaseCertificate !== null && isPdfFile(purchaseCertificate.fileName);

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      attachConferencePrint(requestId, {
        lotIndex,
        printFile: file,
      }),
    onSuccess: async () => {
      toast.success(`Impressão anexada para o lote ${lotIndex}.`);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await queryClient.invalidateQueries({
        queryKey: certificateRequestDetailQueryKey(requestId),
      });
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Não foi possível anexar a impressão.';
      toast.error(message);
    },
  });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const inspection = printAttachment?.inspection ?? null;
  const isInvalid = printAttachment?.validity === 'INVALID';
  const statusLabel = inspection
    ? inspection.isValid
      ? 'OK'
      : 'NOK'
    : printAttachment
      ? 'Pendente'
      : null;

  async function uploadPrintFile(file: File): Promise<void> {
    if (uploadMutation.isPending) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(file));
    uploadMutation.mutate(file);
  }

  async function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();

    const pastedFile = await readImageFileFromClipboard(event.clipboardData);
    if (!pastedFile) {
      toast.error('Nenhuma imagem encontrada na área de transferência.');
      return;
    }

    await uploadPrintFile(pastedFile);
  }

  async function handlePasteButtonClick(): Promise<void> {
    pasteAreaRef.current?.focus();

    try {
      const pastedFile = await readImageFileFromClipboardApi();
      if (pastedFile) {
        await uploadPrintFile(pastedFile);
        return;
      }
    } catch {
      // Clipboard API may require explicit user gesture or permission.
    }

    toast.message('Use Ctrl+V para colar a imagem neste lote.');
  }

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Lote {lotIndex}</p>
          {purchaseCertificate ? (
            <p
              className="mt-0.5 truncate text-xs text-muted-foreground"
              title={purchaseCertificate.fileName}
            >
              PDF: {purchaseCertificate.fileName}
            </p>
          ) : null}
        </div>
        {statusLabel ? (
          <span
            className={cn(
              'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
              statusLabel === 'OK' && 'bg-emerald-100 text-emerald-800',
              statusLabel === 'NOK' && 'bg-red-100 text-red-800',
              statusLabel === 'Pendente' && 'bg-amber-100 text-amber-800',
            )}
          >
            {statusLabel}
          </span>
        ) : null}
      </div>

      {!printAttachment ? (
        <div
          ref={pasteAreaRef}
          tabIndex={0}
          onPaste={(event) => void handlePaste(event)}
          onFocus={() => setIsPasteFocused(true)}
          onBlur={() => setIsPasteFocused(false)}
          className={cn(
            'mt-4 flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-6 text-center transition-colors outline-none',
            isPasteFocused
              ? 'border-brand bg-brand/5'
              : 'border-border bg-muted/20',
          )}
        >
          {uploadMutation.isPending && previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Pré-visualização do print"
                className="max-h-28 w-full object-contain"
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Enviando impressão...
              </div>
            </>
          ) : (
            <>
              <ClipboardPaste className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Cole aqui o print do certificado
              </p>
              <p className="text-xs text-muted-foreground">
                Clique em &quot;Colar print&quot; ou use Ctrl+V
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="mt-4 flex min-h-36 flex-1 items-center justify-center overflow-hidden rounded-xl bg-muted/30 ring-1 ring-border/50">
          {printAttachment && isImageFile(printAttachment.fileName) ? (
            <img
              src={resolveAttachmentUrl(printAttachment.storagePath)}
              alt={printAttachment.fileName}
              className="max-h-40 w-full object-contain"
            />
          ) : printAttachment ? (
            <p className="truncate px-3 text-center text-xs text-muted-foreground">
              {printAttachment.fileName}
            </p>
          ) : null}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void uploadPrintFile(file);
          }
        }}
      />

      {!printAttachment ? (
        <div className="mt-4 space-y-2">
          <Button
            type="button"
            className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
            disabled={uploadMutation.isPending}
            onClick={() => void handlePasteButtonClick()}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ClipboardPaste className="size-4" />
            )}
            Colar print
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="size-4" />
            Escolher arquivo
          </Button>
          {canImportFromPdf ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={uploadMutation.isPending}
              onClick={() => setPdfImportOpen(true)}
            >
              <FileImage className="size-4" />
              Importar do PDF
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {isInvalid ? (
            <p className="text-xs text-destructive">
              Certificado invalidado após conferência.
            </p>
          ) : null}
          {!inspection ? (
            <>
              <Button
                asChild
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <Link
                  to={`/notas-fiscais/${requestId}/comparacao/${printAttachment.id}`}
                >
                  <ClipboardCheck className="size-4" />
                  Fazer comparação
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploadMutation.isPending}
                onClick={() => void handlePasteButtonClick()}
              >
                <ClipboardPaste className="size-4" />
                Trocar print
              </Button>
              {canImportFromPdf ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={uploadMutation.isPending}
                  onClick={() => setPdfImportOpen(true)}
                >
                  <FileImage className="size-4" />
                  Importar do PDF
                </Button>
              ) : null}
            </>
          ) : (
            <Button asChild variant="outline" className="w-full">
              <Link
                to={`/notas-fiscais/${requestId}/comparacao/${printAttachment.id}`}
              >
                Ver conferência
              </Link>
            </Button>
          )}
        </div>
      )}

      {canImportFromPdf && purchaseCertificate ? (
        <PdfPageImportDialog
          open={pdfImportOpen}
          onOpenChange={setPdfImportOpen}
          pdfUrl={resolveAttachmentUrl(purchaseCertificate.storagePath)}
          fileName={purchaseCertificate.fileName}
          lotIndex={lotIndex}
          defaultPage={lotIndex}
          onImport={uploadPrintFile}
        />
      ) : null}
    </article>
  );
}
