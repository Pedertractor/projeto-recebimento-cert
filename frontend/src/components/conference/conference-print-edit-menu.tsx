import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardPaste,
  FileImage,
  FileUp,
  Loader2,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

import { ConferencePrintConfirmDialog } from '@/components/conference/conference-print-confirm-dialog';
import { PdfPageImportDialog } from '@/components/conference/pdf-page-import-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { HttpClientError } from '@/lib/http-client';
import {
  attachConferencePrint,
  certificateRequestDetailQueryKey,
} from '@/services/certificate-requests/certificate-request.service';
import {
  hasPendingConferencePrint,
  subscribePendingConferencePrint,
  takePendingConferencePrint,
} from '@/utils/conference-print-buffer';
import {
  readImageFileFromClipboardApi,
} from '@/utils/clipboard-image';
import { resolveAttachmentUrl } from '@/utils/attachment-url';
import { isPdfFile } from '@/utils/file-type';
import type { RequestAttachment } from '@/types/certificate-request';

type ConferencePrintEditMenuProps = {
  requestId: number;
  lotIndex: number;
  purchaseCertificate: RequestAttachment | null;
};

export function ConferencePrintEditMenu({
  requestId,
  lotIndex,
  purchaseCertificate,
}: ConferencePrintEditMenuProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfImportOpen, setPdfImportOpen] = useState(false);
  const [hasCopiedPage, setHasCopiedPage] = useState(hasPendingConferencePrint);
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const pendingReplaceRef = useRef<(() => void) | null>(null);
  const isMobile = useIsMobile();

  const canImportFromPdf =
    purchaseCertificate !== null && isPdfFile(purchaseCertificate.fileName);
  const showPdfImport = canImportFromPdf && isMobile;

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      attachConferencePrint(requestId, {
        lotIndex,
        printFile: file,
      }),
    onSuccess: async () => {
      toast.success(`Certificado do lote ${lotIndex} atualizado.`);
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
            : 'Não foi possível atualizar o certificado.';
      toast.error(message);
    },
  });

  useEffect(() => {
    return subscribePendingConferencePrint(() => {
      setHasCopiedPage(hasPendingConferencePrint());
    });
  }, []);

  function uploadPrintFile(file: File): void {
    if (uploadMutation.isPending) {
      return;
    }
    uploadMutation.mutate(file);
  }

  function requestReplace(action: () => void): void {
    pendingReplaceRef.current = action;
    setReplaceDialogOpen(true);
  }

  function confirmReplace(): void {
    const action = pendingReplaceRef.current;
    pendingReplaceRef.current = null;
    setReplaceDialogOpen(false);
    action?.();
  }

  function applyPendingCopiedPage(): void {
    const pendingFile = takePendingConferencePrint();
    if (!pendingFile) {
      toast.message('Nenhuma página copiada. Use "Copiar página" na nota fiscal.');
      return;
    }
    requestReplace(() => uploadPrintFile(pendingFile));
  }

  async function handlePasteAction(): Promise<void> {
    if (hasPendingConferencePrint()) {
      applyPendingCopiedPage();
      return;
    }

    try {
      const pastedFile = await readImageFileFromClipboardApi();
      if (pastedFile) {
        requestReplace(() => uploadPrintFile(pastedFile));
        return;
      }
    } catch {
      // Clipboard API may require explicit user gesture or permission.
    }

    toast.message(
      isMobile
        ? 'Copie a página na nota fiscal ou escolha um arquivo.'
        : 'Copie a página na nota fiscal ou use Ctrl+V na área de colagem do lote.',
    );
  }

  function handleFileSelected(file: File): void {
    requestReplace(() => uploadPrintFile(file));
  }

  const isBusy = uploadMutation.isPending;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={isBusy}
            title="Alterar certificado"
          >
            {isBusy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Settings className="size-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Alterar certificado</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {hasCopiedPage ? (
            <DropdownMenuItem
              disabled={isBusy}
              onClick={() => applyPendingCopiedPage()}
            >
              <ClipboardPaste className="size-4" />
              Usar página copiada
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem disabled={isBusy} onClick={() => void handlePasteAction()}>
            <ClipboardPaste className="size-4" />
            {isMobile ? 'Colar print' : 'Colar página'}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="size-4" />
            {isMobile ? 'Escolher arquivo' : 'Anexar imagem do PC'}
          </DropdownMenuItem>
          {showPdfImport ? (
            <DropdownMenuItem disabled={isBusy} onClick={() => setPdfImportOpen(true)}>
              <FileImage className="size-4" />
              Importar do PDF
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={fileInputRef}
        type="file"
        accept={isMobile ? 'image/*,.pdf' : 'image/*'}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            handleFileSelected(file);
          }
        }}
      />

      {showPdfImport && purchaseCertificate ? (
        <PdfPageImportDialog
          open={pdfImportOpen}
          onOpenChange={setPdfImportOpen}
          pdfUrl={resolveAttachmentUrl(purchaseCertificate.storagePath)}
          fileName={purchaseCertificate.fileName}
          lotIndex={lotIndex}
          defaultPage={lotIndex}
          onImport={(file) => requestReplace(() => uploadPrintFile(file))}
        />
      ) : null}

      <ConferencePrintConfirmDialog
        open={replaceDialogOpen}
        onOpenChange={(open) => {
          setReplaceDialogOpen(open);
          if (!open) {
            pendingReplaceRef.current = null;
          }
        }}
        lotIndex={lotIndex}
        intent="replace"
        isPending={uploadMutation.isPending}
        onConfirm={confirmReplace}
      />
    </>
  );
}
