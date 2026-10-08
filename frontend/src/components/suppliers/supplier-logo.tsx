import { Building2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { resolveAttachmentUrl } from '@/utils/attachment-url';

type SupplierLogoProps = {
  name: string;
  logoStoragePath?: string | null;
  className?: string;
  imageClassName?: string;
};

export function SupplierLogo({
  name,
  logoStoragePath,
  className,
  imageClassName,
}: SupplierLogoProps) {
  if (logoStoragePath) {
    return (
      <img
        src={resolveAttachmentUrl(logoStoragePath)}
        alt={`Logo ${name}`}
        className={cn(
          'size-full object-contain object-center',
          imageClassName,
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        'flex size-full items-center justify-center bg-muted text-muted-foreground',
        className,
      )}
      aria-hidden
    >
      <Building2 className="size-5 sm:size-6" />
    </span>
  );
}
