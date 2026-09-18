import { FileText, Paperclip } from 'lucide-react';

import { PdfPageViewer } from '@/components/conference/pdf-page-viewer';
import { RequestAttachmentActions } from '@/components/requests/request-attachment-actions';
import { resolveAttachmentUrl } from '@/utils/attachment-url';
import { isImageFile, isPdfFile } from '@/utils/file-type';
import type { RequestAttachment } from '@/types/certificate-request';

type InvoiceAttachmentCardProps = {
  attachment: RequestAttachment | null;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
};

export function InvoiceAttachmentCard({
  attachment,
  title = 'Nota fiscal',
  subtitle,
  emptyMessage = 'Nenhuma nota fiscal anexada.',
}: InvoiceAttachmentCardProps) {
  return (
    <section className="flex h-full min-h-88 flex-col rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60 sm:p-6 lg:min-h-112">
      <div className="flex items-center gap-2">
        <Paperclip className="size-4 text-brand" />
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
        {attachment ? (
          <>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-muted/30 ring-1 ring-border/50">
              {isImageFile(attachment.fileName) ? (
                <img
                  src={resolveAttachmentUrl(attachment.storagePath)}
                  alt={attachment.fileName}
                  className="size-full object-contain"
                />
              ) : isPdfFile(attachment.fileName) ? (
                <PdfPageViewer
                  pdfUrl={resolveAttachmentUrl(attachment.storagePath)}
                  showCopyButton
                  expandDialogTitle="Nota fiscal"
                  className="size-full p-2"
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center">
                  <FileText className="size-8 text-muted-foreground" />
                  <p className="text-sm font-medium">{attachment.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    Pré-visualização indisponível para este formato.
                  </p>
                </div>
              )}
            </div>

            {isPdfFile(attachment.fileName) ? (
              <p className="text-xs text-muted-foreground">
                Navegue pelas páginas e use &quot;Copiar página&quot; para colar
                no lote, ou importe direto pelo botão em cada lote.
              </p>
            ) : null}

            <RequestAttachmentActions attachment={attachment} compact />
          </>
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl bg-muted/20 px-4 py-8 text-center ring-1 ring-border/50">
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        )}
      </div>
    </section>
  );
}
