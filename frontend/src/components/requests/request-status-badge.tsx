import type { CertificateRequestStatus } from '@/types/certificate-request';
import {
  certificateRequestStatusClassName,
  certificateRequestStatusLabel,
} from '@/lib/certificate-request-labels';
import { cn } from '@/lib/utils';

type RequestStatusBadgeProps = {
  status: CertificateRequestStatus;
  className?: string;
};

export function RequestStatusBadge({
  status,
  className,
}: RequestStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        certificateRequestStatusClassName(status),
        className,
      )}
    >
      {certificateRequestStatusLabel(status)}
    </span>
  );
}
