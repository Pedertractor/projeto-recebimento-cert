import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  FilePlus2,
  Mail,
  MailCheck,
  Paperclip,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react';

import {
  formatRequestDateTime,
  requestHistoryEventLabel,
} from '@/lib/certificate-request-labels';
import { buildHistoryEventAttachmentMap } from '@/lib/match-history-attachment';
import { cn } from '@/lib/utils';
import { RequestAttachmentActions } from '@/components/requests/request-attachment-actions';
import type {
  RequestAttachment,
  RequestHistoryEvent,
} from '@/types/certificate-request';

type EventVisual = {
  icon: LucideIcon;
  dotClassName: string;
  iconClassName: string;
};

function getEventVisual(eventType: string): EventVisual {
  switch (eventType) {
    case 'SOLICITACAO_CRIADA':
      return {
        icon: FilePlus2,
        dotClassName: 'bg-brand/15 ring-brand/25',
        iconClassName: 'text-brand',
      };
    case 'EMAIL_COMPRAS_ENVIADO':
      return {
        icon: Mail,
        dotClassName: 'bg-amber-100 ring-amber-200/80',
        iconClassName: 'text-amber-700',
      };
    case 'ENVIO_FORNECEDOR_REGISTRADO':
      return {
        icon: Send,
        dotClassName: 'bg-sky-100 ring-sky-200/80',
        iconClassName: 'text-sky-700',
      };
    case 'CERTIFICADO_ANEXADO':
      return {
        icon: Paperclip,
        dotClassName: 'bg-emerald-100 ring-emerald-200/80',
        iconClassName: 'text-emerald-700',
      };
    case 'CERTIFICADO_REMOVIDO':
      return {
        icon: Trash2,
        dotClassName: 'bg-rose-100 ring-rose-200/80',
        iconClassName: 'text-rose-700',
      };
    case 'SOLICITACAO_CONCLUIDA':
      return {
        icon: CheckCircle2,
        dotClassName: 'bg-emerald-100 ring-emerald-300/80',
        iconClassName: 'text-emerald-700',
      };
    case 'EMAIL_ESTOQUE_ENVIADO':
      return {
        icon: MailCheck,
        dotClassName: 'bg-brand/15 ring-brand/25',
        iconClassName: 'text-brand',
      };
    case 'SOLICITACAO_CANCELADA':
      return {
        icon: XCircle,
        dotClassName: 'bg-zinc-100 ring-zinc-200/80',
        iconClassName: 'text-zinc-600',
      };
    default:
      return {
        icon: FilePlus2,
        dotClassName: 'bg-muted ring-border/60',
        iconClassName: 'text-muted-foreground',
      };
  }
}

type RequestHistoryTimelineProps = {
  events: RequestHistoryEvent[];
  attachments?: RequestAttachment[];
  className?: string;
};

export function RequestHistoryTimeline({
  events,
  attachments = [],
  className,
}: RequestHistoryTimelineProps) {
  const sortedEvents = [...events].sort(
    (left, right) =>
      new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime(),
  );

  const attachmentByEventId = buildHistoryEventAttachmentMap(
    sortedEvents,
    attachments,
  );

  if (sortedEvents.length === 0) {
    return null;
  }

  const latestEventId = sortedEvents[sortedEvents.length - 1]?.id;

  return (
    <ol className={cn('relative space-y-0', className)}>
      {sortedEvents.map((event, index) => {
        const visual = getEventVisual(event.eventType);
        const Icon = visual.icon;
        const isLatest = event.id === latestEventId;
        const isLast = index === sortedEvents.length - 1;
        const relatedAttachment = attachmentByEventId.get(event.id) ?? null;

        return (
          <li key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
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
                  visual.dotClassName,
                  isLatest && 'ring-brand/20 shadow-sm shadow-brand/10',
                )}
              >
                <Icon className={cn('size-4', visual.iconClassName)} />
              </span>
            </div>

            <div
              className={cn(
                'min-w-0 flex-1 rounded-2xl px-4 py-3 transition-colors',
                isLatest
                  ? 'bg-brand/8 ring-1 ring-brand/15'
                  : 'bg-muted/25',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isLatest ? 'text-brand' : 'text-foreground',
                  )}
                >
                  {requestHistoryEventLabel(event.eventType)}
                </p>
                {isLatest ? (
                  <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-brand uppercase">
                    Atual
                  </span>
                ) : null}
              </div>

              {event.description ? (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              ) : null}

              {relatedAttachment ? (
                <RequestAttachmentActions
                  attachment={relatedAttachment}
                  compact
                />
              ) : null}

              <time
                dateTime={event.occurredAt}
                className="mt-2 block text-xs text-muted-foreground/90"
              >
                {formatRequestDateTime(event.occurredAt)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
