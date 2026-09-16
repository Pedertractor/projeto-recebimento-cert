import { FileCheck } from 'lucide-react';

import { cn } from '@/lib/utils';

type BrandMarkProps = {
  className?: string;
  logoSrc?: string | null;
  alt?: string;
};

export function BrandMark({
  className,
  logoSrc,
  alt = 'Certificado de Qualidade',
}: BrandMarkProps) {
  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt={alt}
        className={cn('size-full object-contain', className)}
      />
    );
  }

  return (
    <FileCheck
      className={cn('size-full text-primary-foreground', className)}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

export const APP_LOGO_SRC = '/icone_plataforma.png';
