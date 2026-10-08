import { Download, ExternalLink } from 'lucide-react';

import {
  canPreviewAttachment,
  resolveAttachmentUrl,
} from '@/utils/attachment-url';
import type { RequestAttachment } from '@/types/certificate-request';

type RequestAttachmentActionsProps = {
  attachment: RequestAttachment;
  compact?: boolean;
};

type AttachmentIconActionsProps = {
  url: string;
  fileName: string;
  canPreview: boolean;
};

function AttachmentIconActions({
  url,
  fileName,
  canPreview,
}: AttachmentIconActionsProps) {
  const iconButtonClassName =
    'inline-flex size-9 items-center justify-center text-brand transition-colors hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40';

  return (
    <div className="inline-flex shrink-0 items-center overflow-hidden rounded-lg ring-1 ring-border/60">
      {canPreview ? (
        <>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={iconButtonClassName}
            aria-label="Visualizar anexo"
            title="Visualizar"
          >
            <ExternalLink className="size-4" />
          </a>
          <div className="h-5 w-px bg-border" aria-hidden="true" />
        </>
      ) : null}
      <a
        href={url}
        download={fileName}
        className={iconButtonClassName}
        aria-label="Baixar anexo"
        title="Baixar"
      >
        <Download className="size-4" />
      </a>
    </div>
  );
}

export function RequestAttachmentActions({
  attachment,
  compact = false,
}: RequestAttachmentActionsProps) {
  const url = resolveAttachmentUrl(attachment.storagePath);
  const canPreview = canPreviewAttachment(attachment.fileName);

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-background/80 px-3 py-2 ring-1 ring-border/50">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{attachment.fileName}</p>
          {attachment.lotLabel ? (
            <p className="text-xs text-muted-foreground">
              Lote: {attachment.lotLabel}
            </p>
          ) : null}
        </div>
        <AttachmentIconActions
          url={url}
          fileName={attachment.fileName}
          canPreview={canPreview}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{attachment.fileName}</p>
        {attachment.lotLabel ? (
          <p className="text-xs text-muted-foreground">
            Lote: {attachment.lotLabel}
          </p>
        ) : null}
      </div>
      <AttachmentIconActions
        url={url}
        fileName={attachment.fileName}
        canPreview={canPreview}
      />
    </div>
  );
}
