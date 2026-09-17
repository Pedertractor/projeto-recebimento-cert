import { Download, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  canPreviewAttachment,
  resolveAttachmentUrl,
} from '@/utils/attachment-url';
import type { RequestAttachment } from '@/types/certificate-request';

type RequestAttachmentActionsProps = {
  attachment: RequestAttachment;
  compact?: boolean;
};

export function RequestAttachmentActions({
  attachment,
  compact = false,
}: RequestAttachmentActionsProps) {
  const url = resolveAttachmentUrl(attachment.storagePath);
  const canPreview = canPreviewAttachment(attachment.fileName);

  return (
    <div
      className={
        compact
          ? 'mt-3 flex flex-col gap-3 rounded-xl bg-background/80 px-3 py-2.5 ring-1 ring-border/50 sm:flex-row sm:items-center sm:justify-between'
          : 'flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2.5'
      }
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{attachment.fileName}</p>
        {attachment.lotLabel ? (
          <p className="text-xs text-muted-foreground">
            Lote: {attachment.lotLabel}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {canPreview ? (
          <Button asChild variant="ghost" size="sm">
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              Visualizar
            </a>
          </Button>
        ) : null}
        <Button asChild variant="outline" size="sm">
          <a href={url} download={attachment.fileName}>
            <Download className="size-4" />
            Baixar
          </a>
        </Button>
      </div>
    </div>
  );
}
