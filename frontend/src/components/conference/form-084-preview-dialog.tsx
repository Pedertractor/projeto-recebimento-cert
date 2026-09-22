import { useMemo } from 'react';

import { QualityManagementFormSection } from '@/components/conference/quality-management-form-section';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getQualityManagementFormColumns } from '@/lib/quality-management-form';
import type { CertificateRequest } from '@/types/certificate-request';

type Form084PreviewDialogProps = {
  request: CertificateRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function Form084PreviewDialog({
  request,
  open,
  onOpenChange,
}: Form084PreviewDialogProps) {
  const columns = useMemo(
    () =>
      request
        ? getQualityManagementFormColumns(
            request.attachments,
            request.expectedCertificates,
            request.supplier.name,
          )
        : [],
    [request],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-4 right-4 bottom-4 left-4 flex h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-h-none max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-xl p-0 sm:max-w-none"
      >
        <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {request ? (
            <QualityManagementFormSection columns={columns} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
