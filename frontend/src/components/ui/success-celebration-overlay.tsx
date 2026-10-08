import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';

type SuccessCelebrationOverlayProps = {
  open: boolean;
  onClose: () => void;
  ariaLabel?: string;
};

const DISPLAY_MS = 2400;

export function SuccessCelebrationOverlay({
  open,
  onClose,
  ariaLabel = 'Operação concluída com sucesso',
}: SuccessCelebrationOverlayProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(onClose, DISPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="purchase-attach-success-backdrop fixed inset-0 z-[200] flex items-center justify-center"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <div className="purchase-attach-success-circle flex size-28 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-xl ring-4 ring-brand/20 sm:size-32">
        <Check
          className="purchase-attach-success-check size-14 sm:size-16"
          strokeWidth={2.5}
          aria-hidden
        />
      </div>
    </div>,
    document.body,
  );
}
