import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  certificateComparisonFormSchema,
  type CertificateComparisonFormValues,
} from '@/schemas/certificate-comparison.schema';
import { cn } from '@/lib/utils';

type CertificateComparisonFormProps = {
  defaultValues: Partial<CertificateComparisonFormValues>;
  readOnly?: boolean;
  isSubmitting?: boolean;
  onSubmit: (values: CertificateComparisonFormValues) => void;
};

type FormRowProps = {
  label: string;
  children: ReactNode;
  alternate?: boolean;
};

function FormRow({ label, children, alternate }: FormRowProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 border-b border-border sm:grid-cols-[minmax(220px,42%)_1fr]',
        alternate ? 'bg-muted/40' : 'bg-background',
      )}
    >
      <div className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:border-b-0 sm:border-r">
        {label}
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function OkNokField({
  value,
  onChange,
  disabled,
  name,
}: {
  value: 'OK' | 'NOK' | undefined;
  onChange: (value: 'OK' | 'NOK') => void;
  disabled?: boolean;
  name: string;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(nextValue) => onChange(nextValue as 'OK' | 'NOK')}
      className="grid grid-cols-2 gap-3 sm:max-w-xs"
      disabled={disabled}
    >
      <label
        htmlFor={`${name}-ok`}
        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
      >
        <RadioGroupItem value="OK" id={`${name}-ok`} />
        OK
      </label>
      <label
        htmlFor={`${name}-nok`}
        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
      >
        <RadioGroupItem value="NOK" id={`${name}-nok`} />
        NOK
      </label>
    </RadioGroup>
  );
}

export function CertificateComparisonForm({
  defaultValues,
  readOnly = false,
  isSubmitting = false,
  onSubmit,
}: CertificateComparisonFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CertificateComparisonFormValues>({
    resolver: zodResolver(certificateComparisonFormSchema),
    defaultValues: {
      receiptDate: '',
      materialDescription: '',
      rm: '',
      certificateNumber: '',
      chemicalComposition: undefined,
      quantitySpecified: '',
      quantityFound: '',
      dimensionalSpecified: '',
      dimensionalFound: '',
      visualInspection: undefined,
      reportStatus: undefined,
      receiverResponsible: '',
      ...defaultValues,
    },
  });

  const receiptDate = watch('receiptDate');

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="overflow-hidden rounded-2xl border border-border">
        <FormRow label="Data do recebimento">
          {readOnly ? (
            <p className="text-sm">{receiptDate || '—'}</p>
          ) : (
            <DatePickerField
              value={receiptDate}
              onChange={(value) =>
                setValue('receiptDate', value, { shouldValidate: true })
              }
            />
          )}
          {errors.receiptDate ? (
            <p className="mt-1 text-xs text-destructive">
              {errors.receiptDate.message}
            </p>
          ) : null}
        </FormRow>

        <FormRow label="Descrição do material" alternate>
          <Input {...register('materialDescription')} disabled={readOnly} />
          {errors.materialDescription ? (
            <p className="mt-1 text-xs text-destructive">
              {errors.materialDescription.message}
            </p>
          ) : null}
        </FormRow>

        <FormRow label="RM">
          <Input {...register('rm')} disabled={readOnly} />
          {errors.rm ? (
            <p className="mt-1 text-xs text-destructive">{errors.rm.message}</p>
          ) : null}
        </FormRow>

        <FormRow label="Nº certificado" alternate>
          <Input {...register('certificateNumber')} disabled={readOnly} />
          {errors.certificateNumber ? (
            <p className="mt-1 text-xs text-destructive">
              {errors.certificateNumber.message}
            </p>
          ) : null}
        </FormRow>

        <FormRow label="Composição química OK ou NOK">
          <OkNokField
            name="chemicalComposition"
            value={watch('chemicalComposition')}
            onChange={(value) =>
              setValue('chemicalComposition', value, { shouldValidate: true })
            }
            disabled={readOnly}
          />
          {errors.chemicalComposition ? (
            <p className="mt-1 text-xs text-destructive">
              {errors.chemicalComposition.message}
            </p>
          ) : null}
        </FormRow>

        <FormRow label="Quantidade especificada na nota fiscal" alternate>
          <Input {...register('quantitySpecified')} disabled={readOnly} />
          {errors.quantitySpecified ? (
            <p className="mt-1 text-xs text-destructive">
              {errors.quantitySpecified.message}
            </p>
          ) : null}
        </FormRow>

        <FormRow label="Quantidade encontrada no recebimento">
          <Input {...register('quantityFound')} disabled={readOnly} />
          {errors.quantityFound ? (
            <p className="mt-1 text-xs text-destructive">
              {errors.quantityFound.message}
            </p>
          ) : null}
        </FormRow>

        <FormRow label="Dimensional especificado NF" alternate>
          <Input {...register('dimensionalSpecified')} disabled={readOnly} />
          {errors.dimensionalSpecified ? (
            <p className="mt-1 text-xs text-destructive">
              {errors.dimensionalSpecified.message}
            </p>
          ) : null}
        </FormRow>

        <FormRow label="Dimensional encontrado no recebimento">
          <Input {...register('dimensionalFound')} disabled={readOnly} />
          {errors.dimensionalFound ? (
            <p className="mt-1 text-xs text-destructive">
              {errors.dimensionalFound.message}
            </p>
          ) : null}
        </FormRow>

        <FormRow label="Visual encont. OK ou NOK" alternate>
          <OkNokField
            name="visualInspection"
            value={watch('visualInspection')}
            onChange={(value) =>
              setValue('visualInspection', value, { shouldValidate: true })
            }
            disabled={readOnly}
          />
          {errors.visualInspection ? (
            <p className="mt-1 text-xs text-destructive">
              {errors.visualInspection.message}
            </p>
          ) : null}
        </FormRow>

        <FormRow label="Laudo ap. ou rep.">
          <OkNokField
            name="reportStatus"
            value={watch('reportStatus')}
            onChange={(value) =>
              setValue('reportStatus', value, { shouldValidate: true })
            }
            disabled={readOnly}
          />
          {errors.reportStatus ? (
            <p className="mt-1 text-xs text-destructive">
              {errors.reportStatus.message}
            </p>
          ) : null}
        </FormRow>

        <FormRow label="Recebedor resp." alternate>
          <Input {...register('receiverResponsible')} disabled={readOnly} />
          {errors.receiverResponsible ? (
            <p className="mt-1 text-xs text-destructive">
              {errors.receiverResponsible.message}
            </p>
          ) : null}
        </FormRow>
      </div>

      {!readOnly ? (
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Salvar conferência
          </Button>
        </div>
      ) : null}
    </form>
  );
}
