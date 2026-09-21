import { useRef } from 'react';

import { QualityManagementFormSheet } from '@/components/conference/quality-management-form-sheet';
import type { QualityManagementFormColumn } from '@/lib/quality-management-form';

type QualityManagementFormSectionProps = {
  columns: QualityManagementFormColumn[];
};

export function QualityManagementFormSection({
  columns,
}: QualityManagementFormSectionProps) {
  const formRef = useRef<HTMLDivElement>(null);

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
      </div>
      <QualityManagementFormSheet ref={formRef} columns={columns} />
    </section>
  );
}
