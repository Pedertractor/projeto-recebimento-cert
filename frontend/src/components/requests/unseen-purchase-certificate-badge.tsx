import { FileBadge } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function UnseenPurchaseCertificateBadge({
  className,
}: {
  className?: string;
}) {
  return (
    <Badge
      variant="default"
      className={cn('gap-1.5', className)}
      title="Certificado anexado pelo compras ainda não visualizado pela equipe de estoque"
    >
      <FileBadge className="size-3.5 shrink-0" aria-hidden />
      Novo certificado
    </Badge>
  );
}
