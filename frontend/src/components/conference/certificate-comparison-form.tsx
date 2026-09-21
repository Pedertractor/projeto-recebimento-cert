import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Pencil, Save, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { HttpClientError } from '@/lib/http-client';
import { cn } from '@/lib/utils';
import {
  certificateComparisonFormSchema,
  type CertificateComparisonFormValues,
} from '@/schemas/certificate-comparison.schema';
import { fetchEmployeeByCardAndUnitOrNull } from '@/services/users/user.service';
import { UNIT_LABELS, UNITS, type Unit } from '@/types/unit';

const LOCKABLE_FIELDS = [
  'receiptDate',
  'materialDescription',
  'rm',
  'certificateNumber',
  'chemicalComposition',
  'quantitySpecified',
  'quantityFound',
  'dimensionalSpecified',
  'dimensionalFound',
  'visualInspection',
  'reportStatus',
  'receiverResponsible',
] as const;

type LockableField = (typeof LOCKABLE_FIELDS)[number];

type CertificateComparisonFormProps = {
  defaultValues: Partial<CertificateComparisonFormValues>;
  hasSavedInspection?: boolean;
  currentUser?: {
    name: string | null;
    employeeId: number;
    unit: Unit;
  };
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

function FieldWithPencil({
  locked,
  onUnlock,
  label,
  children,
}: {
  locked: boolean;
  onUnlock: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">{children}</div>
      {locked ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="mt-0.5 shrink-0"
          aria-label={`Editar ${label}`}
          title={`Editar ${label}`}
          onClick={onUnlock}
        >
          <Pencil className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}

export function CertificateComparisonForm({
  defaultValues,
  hasSavedInspection = false,
  currentUser,
  isSubmitting = false,
  onSubmit,
}: CertificateComparisonFormProps) {
  const [lockedFields, setLockedFields] = useState<Set<LockableField>>(
    () => new Set(hasSavedInspection ? LOCKABLE_FIELDS : []),
  );
  const [showOtherReceiver, setShowOtherReceiver] = useState(false);
  const [lookupCard, setLookupCard] = useState('');
  const [lookupUnit, setLookupUnit] = useState<Unit>(
    currentUser?.unit ?? 'PEDERTRACTOR',
  );

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
      receiverResponsible: currentUser?.name ?? '',
      receiverEmployeeId: currentUser?.employeeId ?? null,
      ...defaultValues,
    },
  });

  const receiptDate = watch('receiptDate');
  const receiverName = watch('receiverResponsible');
  const receiverEmployeeId = watch('receiverEmployeeId');

  const lookupMutation = useMutation({
    mutationFn: () => fetchEmployeeByCardAndUnitOrNull(lookupCard, lookupUnit),
    onSuccess: (employee) => {
      if (!employee) {
        toast.error('Colaborador não encontrado para este cartão e unidade.');
        return;
      }

      setValue('receiverResponsible', employee.name, { shouldValidate: true });
      setValue('receiverEmployeeId', employee.id, { shouldValidate: true });
      toast.success(`Recebedor definido: ${employee.name}.`);
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : 'Não foi possível buscar o colaborador.';
      toast.error(message);
    },
  });

  function isLocked(field: LockableField): boolean {
    return lockedFields.has(field);
  }

  function unlock(field: LockableField): void {
    setLockedFields((current) => {
      const next = new Set(current);
      next.delete(field);
      return next;
    });
  }

  const canSave = !hasSavedInspection || lockedFields.size < LOCKABLE_FIELDS.length;

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="overflow-hidden rounded-2xl border border-border">
        <FormRow label="Data do recebimento">
          <FieldWithPencil
            locked={isLocked('receiptDate')}
            onUnlock={() => unlock('receiptDate')}
            label="data do recebimento"
          >
            {isLocked('receiptDate') ? (
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
          </FieldWithPencil>
        </FormRow>

        <FormRow label="Descrição do material" alternate>
          <FieldWithPencil
            locked={isLocked('materialDescription')}
            onUnlock={() => unlock('materialDescription')}
            label="descrição do material"
          >
            <Input
              {...register('materialDescription')}
              disabled={isLocked('materialDescription')}
            />
            {errors.materialDescription ? (
              <p className="mt-1 text-xs text-destructive">
                {errors.materialDescription.message}
              </p>
            ) : null}
          </FieldWithPencil>
        </FormRow>

        <FormRow label="RM">
          <FieldWithPencil
            locked={isLocked('rm')}
            onUnlock={() => unlock('rm')}
            label="RM"
          >
            <Input {...register('rm')} disabled={isLocked('rm')} />
            {errors.rm ? (
              <p className="mt-1 text-xs text-destructive">{errors.rm.message}</p>
            ) : null}
          </FieldWithPencil>
        </FormRow>

        <FormRow label="Nº certificado" alternate>
          <FieldWithPencil
            locked={isLocked('certificateNumber')}
            onUnlock={() => unlock('certificateNumber')}
            label="número do certificado"
          >
            <Input
              {...register('certificateNumber')}
              disabled={isLocked('certificateNumber')}
            />
            {errors.certificateNumber ? (
              <p className="mt-1 text-xs text-destructive">
                {errors.certificateNumber.message}
              </p>
            ) : null}
          </FieldWithPencil>
        </FormRow>

        <FormRow label="Composição química OK ou NOK">
          <FieldWithPencil
            locked={isLocked('chemicalComposition')}
            onUnlock={() => unlock('chemicalComposition')}
            label="composição química"
          >
            <OkNokField
              name="chemicalComposition"
              value={watch('chemicalComposition')}
              onChange={(value) =>
                setValue('chemicalComposition', value, { shouldValidate: true })
              }
              disabled={isLocked('chemicalComposition')}
            />
            {errors.chemicalComposition ? (
              <p className="mt-1 text-xs text-destructive">
                {errors.chemicalComposition.message}
              </p>
            ) : null}
          </FieldWithPencil>
        </FormRow>

        <FormRow label="Quantidade especificada na nota fiscal" alternate>
          <FieldWithPencil
            locked={isLocked('quantitySpecified')}
            onUnlock={() => unlock('quantitySpecified')}
            label="quantidade especificada"
          >
            <Input
              {...register('quantitySpecified')}
              disabled={isLocked('quantitySpecified')}
            />
            {errors.quantitySpecified ? (
              <p className="mt-1 text-xs text-destructive">
                {errors.quantitySpecified.message}
              </p>
            ) : null}
          </FieldWithPencil>
        </FormRow>

        <FormRow label="Quantidade encontrada no recebimento">
          <FieldWithPencil
            locked={isLocked('quantityFound')}
            onUnlock={() => unlock('quantityFound')}
            label="quantidade encontrada"
          >
            <Input
              {...register('quantityFound')}
              disabled={isLocked('quantityFound')}
            />
            {errors.quantityFound ? (
              <p className="mt-1 text-xs text-destructive">
                {errors.quantityFound.message}
              </p>
            ) : null}
          </FieldWithPencil>
        </FormRow>

        <FormRow label="Dimensional especificado NF" alternate>
          <FieldWithPencil
            locked={isLocked('dimensionalSpecified')}
            onUnlock={() => unlock('dimensionalSpecified')}
            label="dimensional especificado"
          >
            <Input
              {...register('dimensionalSpecified')}
              disabled={isLocked('dimensionalSpecified')}
            />
            {errors.dimensionalSpecified ? (
              <p className="mt-1 text-xs text-destructive">
                {errors.dimensionalSpecified.message}
              </p>
            ) : null}
          </FieldWithPencil>
        </FormRow>

        <FormRow label="Dimensional encontrado no recebimento">
          <FieldWithPencil
            locked={isLocked('dimensionalFound')}
            onUnlock={() => unlock('dimensionalFound')}
            label="dimensional encontrado"
          >
            <Input
              {...register('dimensionalFound')}
              disabled={isLocked('dimensionalFound')}
            />
            {errors.dimensionalFound ? (
              <p className="mt-1 text-xs text-destructive">
                {errors.dimensionalFound.message}
              </p>
            ) : null}
          </FieldWithPencil>
        </FormRow>

        <FormRow label="Visual encont. OK ou NOK" alternate>
          <FieldWithPencil
            locked={isLocked('visualInspection')}
            onUnlock={() => unlock('visualInspection')}
            label="inspeção visual"
          >
            <OkNokField
              name="visualInspection"
              value={watch('visualInspection')}
              onChange={(value) =>
                setValue('visualInspection', value, { shouldValidate: true })
              }
              disabled={isLocked('visualInspection')}
            />
            {errors.visualInspection ? (
              <p className="mt-1 text-xs text-destructive">
                {errors.visualInspection.message}
              </p>
            ) : null}
          </FieldWithPencil>
        </FormRow>

        <FormRow label="Laudo ap. ou rep.">
          <FieldWithPencil
            locked={isLocked('reportStatus')}
            onUnlock={() => unlock('reportStatus')}
            label="laudo"
          >
            <OkNokField
              name="reportStatus"
              value={watch('reportStatus')}
              onChange={(value) =>
                setValue('reportStatus', value, { shouldValidate: true })
              }
              disabled={isLocked('reportStatus')}
            />
            {errors.reportStatus ? (
              <p className="mt-1 text-xs text-destructive">
                {errors.reportStatus.message}
              </p>
            ) : null}
          </FieldWithPencil>
        </FormRow>

        <FormRow label="Recebedor resp." alternate>
          <FieldWithPencil
            locked={isLocked('receiverResponsible')}
            onUnlock={() => unlock('receiverResponsible')}
            label="recebedor responsável"
          >
            <Input
              {...register('receiverResponsible')}
              disabled={isLocked('receiverResponsible')}
            />
            {receiverEmployeeId ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Matrícula {receiverEmployeeId}
                {receiverName ? ` · ${receiverName}` : ''}
              </p>
            ) : null}
            {errors.receiverResponsible ? (
              <p className="mt-1 text-xs text-destructive">
                {errors.receiverResponsible.message}
              </p>
            ) : null}

            {!isLocked('receiverResponsible') ? (
              <div className="mt-3 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOtherReceiver((open) => !open)}
                >
                  {showOtherReceiver
                    ? 'Ocultar busca'
                    : 'Indicar outro recebedor'}
                </Button>

                {showOtherReceiver ? (
                  <div className="space-y-3 rounded-xl border border-border bg-background/80 p-3">
                    <p className="text-xs text-muted-foreground">
                      Busque na base por cartão e unidade. Opcional.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <div className="space-y-1.5">
                        <Label htmlFor="receiver-card">Cartão</Label>
                        <Input
                          id="receiver-card"
                          inputMode="numeric"
                          value={lookupCard}
                          onChange={(event) => setLookupCard(event.target.value)}
                          placeholder="Número do cartão"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Unidade</Label>
                        <div className="flex gap-2">
                          {UNITS.map((unit) => (
                            <Button
                              key={unit}
                              type="button"
                              variant="outline"
                              size="sm"
                              className={cn(
                                lookupUnit === unit &&
                                  'bg-brand-muted text-foreground',
                              )}
                              onClick={() => setLookupUnit(unit)}
                            >
                              {UNIT_LABELS[unit]}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={
                          !lookupCard.trim() || lookupMutation.isPending
                        }
                        onClick={() => lookupMutation.mutate()}
                      >
                        {lookupMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Search className="size-4" />
                        )}
                        Buscar
                      </Button>
                      {currentUser ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setValue(
                              'receiverResponsible',
                              currentUser.name ?? '',
                              { shouldValidate: true },
                            );
                            setValue(
                              'receiverEmployeeId',
                              currentUser.employeeId,
                              { shouldValidate: true },
                            );
                            setShowOtherReceiver(false);
                          }}
                        >
                          Usar meu usuário
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </FieldWithPencil>
        </FormRow>
      </div>

      {canSave ? (
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
            {hasSavedInspection ? 'Salvar alterações' : 'Salvar conferência'}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
