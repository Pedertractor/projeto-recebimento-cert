import { FileText } from 'lucide-react';

import { PdfPageViewer } from '@/components/conference/pdf-page-viewer';
import { RequestAttachmentActions } from '@/components/requests/request-attachment-actions';
import { resolveAttachmentUrl } from '@/utils/attachment-url';
import { isPdfFile } from '@/utils/file-type';
import type { RequestAttachment } from '@/types/certificate-request';

type PurchaseCertificatePdfPanelProps = {
  attachment: RequestAttachment;
};

export function PurchaseCertificatePdfPanel({
  attachment,
}: PurchaseCertificatePdfPanelProps) {
  if (!isPdfFile(attachment.fileName)) {
    return null;
  }

  return (
    <section className="flex min-h-88 flex-col rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60 sm:p-6 lg:min-h-112">
      <div className="flex items-center gap-2">
        <FileText className="size-4 text-brand" />
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            PDF dos certificados
          </h2>
          <p className="text-xs text-muted-foreground">{attachment.fileName}</p>
        </div>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
        <PdfPageViewer
          pdfUrl={resolveAttachmentUrl(attachment.storagePath)}
          showCopyButton
          expandDialogTitle="PDF dos certificados"
        />
        <p className="text-xs text-muted-foreground">
          Use &quot;Importar do PDF&quot; em cada lote para anexar a página
          correspondente, ou copie a página e cole com Ctrl+V.
        </p>
        <RequestAttachmentActions attachment={attachment} compact />
      </div>
    </section>
  );
}
