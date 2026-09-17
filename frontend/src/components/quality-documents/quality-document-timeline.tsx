import { FileText } from 'lucide-react';

import { RequestAttachmentActions } from '@/components/requests/request-attachment-actions';
import { formatRequestDateTime } from '@/lib/certificate-request-labels';
import { cn } from '@/lib/utils';
import type { QualityDocument } from '@/types/quality-document';

type QualityDocumentTimelineProps = {
  documents: QualityDocument[];
  className?: string;
};

export function QualityDocumentTimeline({
  documents,
  className,
}: QualityDocumentTimelineProps) {
  if (documents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma versão publicada ainda.
      </p>
    );
  }

  const latestDocumentId = documents[0]?.id;

  return (
    <ol className={cn('relative space-y-0', className)}>
      {documents.map((document, index) => {
        const isLatest = document.id === latestDocumentId;
        const isLast = index === documents.length - 1;

        return (
          <li key={document.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden
                className="absolute top-10 left-4.5 h-[calc(100%-1.5rem)] w-px bg-linear-to-b from-brand/30 via-border to-border/40"
              />
            ) : null}

            <div className="relative z-10 shrink-0">
              <span
                className={cn(
                  'flex size-9 items-center justify-center rounded-full ring-4 ring-background',
                  isLatest
                    ? 'bg-muted text-foreground'
                    : 'bg-muted/60 text-muted-foreground',
                )}
              >
                <FileText className="size-4" />
              </span>
            </div>

            <div
              className={cn(
                'min-w-0 flex-1 rounded-xl px-4 py-3',
                isLatest ? 'bg-muted/40' : 'bg-muted/20',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{document.displayName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {document.uploadedByName ?? 'Operador de estoque'}
                  </p>
                </div>
                {isLatest ? (
                  <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Atual
                  </span>
                ) : null}
              </div>

              <RequestAttachmentActions
                attachment={{
                  id: document.id,
                  type: 'CERTIFICADO',
                  fileName: document.fileName,
                  storagePath: document.storagePath,
                  lotLabel: null,
                  uploadedAt: document.createdAt,
                }}
                compact
              />

              <time
                dateTime={document.createdAt}
                className="mt-2 block text-xs text-muted-foreground/90"
              >
                {formatRequestDateTime(document.createdAt)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
