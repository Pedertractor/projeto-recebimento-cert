import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { FileText, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

import { PdfPageViewer } from '@/components/conference/pdf-page-viewer';
import { Button } from '@/components/ui/button';
import { resolveAttachmentUrl } from '@/utils/attachment-url';
import { isImageFile, isPdfFile } from '@/utils/file-type';
import { cn } from '@/lib/utils';

type ComparisonDocumentPreviewProps = {
  title: string;
  subtitle?: string;
  fileName: string;
  storagePath: string;
};

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const ZOOM_STEP = 0.35;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function ComparisonDocumentPreview({
  title,
  subtitle,
  fileName,
  storagePath,
}: ComparisonDocumentPreviewProps) {
  const url = resolveAttachmentUrl(storagePath);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const canPreview = isImageFile(fileName);
  const isPdf = isPdfFile(fileName);

  function applyZoom(nextScale: number, originX: number, originY: number): void {
    const clamped = clamp(nextScale, MIN_SCALE, MAX_SCALE);

    if (clamped === MIN_SCALE) {
      setScale(MIN_SCALE);
      setPosition({ x: 0, y: 0 });
      return;
    }

    const contentX = (originX - position.x) / scale;
    const contentY = (originY - position.y) / scale;

    setScale(clamped);
    setPosition({
      x: originX - contentX * clamped,
      y: originY - contentY * clamped,
    });
  }

  function zoomBy(delta: number): void {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const rect = viewport.getBoundingClientRect();
    applyZoom(scale + delta, rect.width / 2, rect.height / 2);
  }

  function resetZoom(): void {
    setScale(MIN_SCALE);
    setPosition({ x: 0, y: 0 });
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !canPreview) {
      return;
    }

    const element = viewport;

    function handleWheel(event: WheelEvent): void {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const originX = event.clientX - rect.left;
      const originY = event.clientY - rect.top;
      const direction = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      applyZoom(scale + direction, originX, originY);
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [canPreview, scale, position.x, position.y]);

  function handleDoubleClick(event: MouseEvent<HTMLDivElement>): void {
    if (!canPreview) {
      return;
    }

    if (scale > MIN_SCALE) {
      resetZoom();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    applyZoom(2.5, event.clientX - rect.left, event.clientY - rect.top);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
    if (!canPreview || event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
    setIsDragging(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || scale <= MIN_SCALE) {
      return;
    }

    setPosition({
      x: drag.originX + (event.clientX - drag.startX),
      y: drag.originY + (event.clientY - drag.startY),
    });
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>): void {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      setIsDragging(false);
    }
  }

  return (
    <section className="flex min-h-0 flex-col rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 truncate text-sm font-medium">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {canPreview ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={scale <= MIN_SCALE}
                onClick={() => zoomBy(-ZOOM_STEP)}
                title="Diminuir zoom"
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={scale >= MAX_SCALE}
                onClick={() => zoomBy(ZOOM_STEP)}
                title="Aumentar zoom"
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={scale === MIN_SCALE}
                onClick={resetZoom}
                title="Resetar zoom"
              >
                <RotateCcw className="size-4" />
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {isPdf ? (
        <PdfPageViewer
          pdfUrl={url}
          className="mt-4 min-h-80 lg:min-h-125"
          expandDialogTitle={subtitle ?? title}
        />
      ) : (
      <div
        ref={viewportRef}
        className={cn(
          'relative mt-4 min-h-80 flex-1 overflow-hidden rounded-xl bg-muted/30 ring-1 ring-border/50 lg:min-h-125',
          canPreview && (isDragging ? 'cursor-grabbing' : 'cursor-zoom-in'),
        )}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {isImageFile(fileName) ? (
          <img
            src={url}
            alt={fileName}
            draggable={false}
            className="pointer-events-none size-full origin-top-left object-contain select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center">
            <FileText className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">{fileName}</p>
            <p className="text-xs text-muted-foreground">
              Pré-visualização indisponível para este formato.
            </p>
          </div>
        )}

        {canPreview ? (
          <p className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-background/80 px-2 py-1 text-[11px] text-muted-foreground">
            {Math.round(scale * 100)}% · scroll para zoom · arraste para mover
          </p>
        ) : null}
      </div>
      )}
    </section>
  );
}
