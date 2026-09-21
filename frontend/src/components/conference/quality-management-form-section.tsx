import { useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { QualityManagementFormSheet } from '@/components/conference/quality-management-form-sheet';
import { Button } from '@/components/ui/button';
import type { QualityManagementFormColumn } from '@/lib/quality-management-form';
import { downloadElementAsPdf } from '@/utils/download-element-as-pdf';

type QualityManagementFormSectionProps = {
  columns: QualityManagementFormColumn[];
  invoiceNumber: string;
};

function buildPdfFileName(invoiceNumber: string): string {
  const safeInvoiceNumber = invoiceNumber.trim().replace(/[^\w.-]+/g, '_');
  return `form-084-nf-${safeInvoiceNumber || 'sem-numero'}.pdf`;
}

export function QualityManagementFormSection({
  columns,
  invoiceNumber,
}: QualityManagementFormSectionProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload(): Promise<void> {
    const element = formRef.current;
    if (!element) {
      return;
    }

    setIsDownloading(true);

    try {
      await downloadElementAsPdf(element, {
        fileName: buildPdfFileName(invoiceNumber),
      });
      toast.success('Formulário baixado em PDF.');
    } catch {
      toast.error('Não foi possível gerar o PDF do formulário.');
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Formulário do sistema de gestão de qualidade
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Consolida as conferências de todos os lotes no padrão FORM-084.
          </p>
        </div>
        {/* <Button
          type="button"
          variant="outline"
          className="shrink-0"
          disabled={isDownloading}
          onClick={() => void handleDownload()}
        >
          {isDownloading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Baixar PDF
        </Button> */}
      </div>
      <QualityManagementFormSheet ref={formRef} columns={columns} />
    </section>
  );
}
