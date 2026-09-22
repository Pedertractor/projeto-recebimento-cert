import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  FileText,
  FileUp,
  Loader2,
  Mail,
  Plus,
  SendHorizontal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { CreateSupplierDialog } from '@/components/suppliers/create-supplier-dialog';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HttpClientError } from '@/lib/http-client';
import { cn } from '@/lib/utils';
import {
  createCertificateRequestFormSchema,
  type CreateCertificateRequestFormValues,
} from '@/schemas/create-certificate-request.schema';
import {
  certificateRequestsListQueryKey,
  completedCertificateRequestsQueryKey,
  createCertificateRequest,
  pendingPurchaseCertificateRequestsQueryKey,
  purchaseCertificateRequestsListQueryKey,
  requestDocumentFromPurchase,
} from '@/services/certificate-requests/certificate-request.service';
import {
  listSuppliers,
  suppliersListQueryKey,
} from '@/services/suppliers/supplier.service';

type DocumentChoice = 'have-invoice' | 'request-invoice';

export function SolicitarCertificadoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const supplierAnchorRef = useComboboxAnchor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [documentChoice, setDocumentChoice] = useState<DocumentChoice | null>(
    null,
  );
  const [documentChoiceError, setDocumentChoiceError] = useState<string | null>(
    null,
  );
  const [isFileDragOver, setIsFileDragOver] = useState(false);

  const suppliersQuery = useQuery({
    queryKey: suppliersListQueryKey,
    queryFn: () => listSuppliers(),
  });

  const suppliers = suppliersQuery.data ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCertificateRequestFormValues>({
    resolver: zodResolver(createCertificateRequestFormSchema),
    defaultValues: {
      supplierId: 0,
      invoiceNumber: '',
      invoiceDate: '',
      expectedCertificates: 1,
      notes: '',
    },
  });

  const supplierId = watch('supplierId');
  const invoiceNumber = watch('invoiceNumber');
  const invoiceDate = watch('invoiceDate');
  const expectedCertificates = watch('expectedCertificates');

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => supplier.id === supplierId) ?? null,
    [supplierId, suppliers],
  );

  const mutation = useMutation({
    mutationFn: async (values: CreateCertificateRequestFormValues) => {
      const created = await createCertificateRequest({
        ...values,
        invoiceFile:
          documentChoice === 'have-invoice' ? values.invoiceFile : undefined,
      });

      if (documentChoice === 'request-invoice') {
        return requestDocumentFromPurchase(created.id);
      }

      return created;
    },
    onSuccess: (request) => {
      toast.success(
        documentChoice === 'request-invoice'
          ? `NF #${request.id} cadastrada e solicitada ao compras.`
          : `NF #${request.id} cadastrada.`,
      );
      void queryClient.invalidateQueries({
        queryKey: certificateRequestsListQueryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: completedCertificateRequestsQueryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: purchaseCertificateRequestsListQueryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: pendingPurchaseCertificateRequestsQueryKey,
      });
      navigate(`/notas-fiscais/${request.id}`);
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : 'Não foi possível cadastrar a NF.';
      toast.error(message);
    },
  });

  function applyInvoiceFile(file: File | undefined): void {
    if (!file) {
      setSelectedFileName(null);
      setValue('invoiceFile', undefined, { shouldValidate: true });
      return;
    }

    setValue('invoiceFile', file, { shouldValidate: true });
    setSelectedFileName(file.name);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    applyInvoiceFile(event.target.files?.[0]);
  }

  function handleFileDrop(event: DragEvent<HTMLButtonElement>): void {
    event.preventDefault();
    setIsFileDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      applyInvoiceFile(file);
    }
  }

  function handleDocumentChoice(choice: DocumentChoice): void {
    setDocumentChoice(choice);
    setDocumentChoiceError(null);

    if (choice === 'request-invoice') {
      setSelectedFileName(null);
      setValue('invoiceFile', undefined, { shouldValidate: true });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function onSubmit(values: CreateCertificateRequestFormValues): void {
    if (!documentChoice) {
      setDocumentChoiceError(
        'Escolha se você já tem a NF ou se deseja solicitar.',
      );
      return;
    }

    mutation.mutate(values);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Cadastrar NF de materiais
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Siga as etapas. No final, anexe a nota se já tiver o arquivo ou peça
          ao compras para solicitá-la.
        </p>
      </div>

      <form className="space-y-0" onSubmit={handleSubmit(onSubmit)}>
        <ol className="relative">
          <FormTimelineStep
            step={1}
            title="Fornecedor"
            description="Quem emitiu a nota fiscal."
            complete={supplierId > 0}
          >
            <div className="flex flex-col gap-3">
              <Combobox
                items={suppliers}
                value={selectedSupplier}
                onValueChange={(supplier) =>
                  setValue('supplierId', supplier?.id ?? 0, {
                    shouldValidate: true,
                  })
                }
                itemToStringLabel={(supplier) => supplier.name}
              >
                <div
                  ref={supplierAnchorRef}
                  className="flex w-full min-w-0 items-stretch overflow-hidden rounded-md border border-input bg-background shadow-xs"
                >
                  <ComboboxInput
                    placeholder={
                      suppliersQuery.isLoading
                        ? 'Carregando fornecedores…'
                        : 'Selecione o fornecedor'
                    }
                    className="min-h-10 min-w-0 flex-1 border-0 shadow-none"
                    showClear
                  />
                </div>
                <ComboboxContent
                  anchor={supplierAnchorRef}
                  className="w-(--anchor-width)"
                >
                  <ComboboxEmpty>
                    {suppliers.length === 0
                      ? 'Cadastre um fornecedor para continuar.'
                      : 'Nenhum fornecedor encontrado.'}
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(supplier) => (
                      <ComboboxItem key={supplier.id} value={supplier}>
                        <div className="flex flex-col">
                          <span>{supplier.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {supplier.cnpj}
                          </span>
                        </div>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              <CreateSupplierDialog
                onCreated={(id) =>
                  setValue('supplierId', id, { shouldValidate: true })
                }
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="-ml-2 w-fit text-muted-foreground"
                  >
                    <Plus className="size-4" />
                    Cadastrar novo fornecedor
                  </Button>
                }
              />
              {errors.supplierId?.message ? (
                <p className="text-sm text-destructive">
                  {errors.supplierId.message}
                </p>
              ) : null}
            </div>
          </FormTimelineStep>

          <FormTimelineStep
            step={2}
            title="Identificação da NF"
            description="Número e data que aparecem no documento."
            complete={Boolean(invoiceNumber?.trim()) && Boolean(invoiceDate)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="invoiceNumber">Número da nota fiscal</Label>
                <Input
                  id="invoiceNumber"
                  placeholder="Digite o número da NF"
                  {...register('invoiceNumber')}
                />
                {errors.invoiceNumber?.message ? (
                  <p className="text-sm text-destructive">
                    {errors.invoiceNumber.message}
                  </p>
                ) : null}
              </div>

              <DatePickerField
                label="Data da nota fiscal"
                value={invoiceDate}
                onChange={(value) =>
                  setValue('invoiceDate', value, { shouldValidate: true })
                }
              />
            </div>
          </FormTimelineStep>

          <FormTimelineStep
            step={3}
            title="Lotes na NF"
            description="Quantos lotes (certificados) esta nota cobre."
            complete={Number(expectedCertificates) >= 1}
          >
            <div className="max-w-40 space-y-1.5">
              <Label htmlFor="expectedCertificates">Quantidade de lotes</Label>
              <Input
                id="expectedCertificates"
                type="number"
                min={1}
                max={99}
                {...register('expectedCertificates', { valueAsNumber: true })}
              />
              {errors.expectedCertificates?.message ? (
                <p className="text-sm text-destructive">
                  {errors.expectedCertificates.message}
                </p>
              ) : null}
            </div>
          </FormTimelineStep>

          <FormTimelineStep
            step={4}
            title="Observações"
            description="Opcional. Use para detalhes que ajudem o compras ou a conferência."
            complete={Boolean(watch('notes')?.trim())}
            optional
          >
            <Input
              id="notes"
              placeholder="Informações adicionais"
              {...register('notes')}
            />
          </FormTimelineStep>

          <FormTimelineStep
            step={5}
            title="Documento da NF"
            description="Escolha o caminho mais simples para o seu caso."
            complete={documentChoice !== null}
            isLast
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <DocumentChoiceCard
                selected={documentChoice === 'have-invoice'}
                dimmed={
                  documentChoice !== null &&
                  documentChoice !== 'have-invoice'
                }
                icon={<FileText className="size-5" />}
                title="Tenho a nota fiscal com certificados"
                description="Caso já tenha o arquivo, anexe o arquivo agora."
                onSelect={() => handleDocumentChoice('have-invoice')}
              />
              <DocumentChoiceCard
                selected={documentChoice === 'request-invoice'}
                dimmed={
                  documentChoice !== null &&
                  documentChoice !== 'request-invoice'
                }
                icon={<Mail className="size-5" />}
                title="Solicitar nota fiscal com certificados"
                description="Solicita a nota fiscal com certificados ao compras."
                onSelect={() => handleDocumentChoice('request-invoice')}
              />
            </div>

            {documentChoiceError ? (
              <p className="text-sm text-destructive">{documentChoiceError}</p>
            ) : null}

            {documentChoice === 'have-invoice' ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsFileDragOver(true);
                  }}
                  onDragLeave={() => setIsFileDragOver(false)}
                  onDrop={handleFileDrop}
                  className={cn(
                    'flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
                    isFileDragOver
                      ? 'border-brand bg-brand-muted/40'
                      : selectedFileName
                        ? 'border-brand/60 bg-brand-muted/20'
                        : 'border-muted-foreground/35 bg-muted/20 hover:border-muted-foreground/55 hover:bg-muted/35',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-14 items-center justify-center rounded-2xl',
                      selectedFileName
                        ? 'bg-brand text-brand-foreground'
                        : 'bg-background text-muted-foreground shadow-sm ring-1 ring-border',
                    )}
                  >
                    {selectedFileName ? (
                      <FileUp className="size-7" />
                    ) : (
                      <FileText className="size-7" />
                    )}
                  </span>
                  {selectedFileName ? (
                    <>
                      <p className="max-w-full truncate text-sm font-semibold">
                        {selectedFileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Clique para trocar o arquivo · PDF ou imagem, até 30 MB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold">
                        Clique ou arraste o arquivo aqui
                      </p>
                      <p className="max-w-sm text-xs text-muted-foreground">
                        Anexe a nota fiscal com certificados. PDF ou imagem, até
                        30 MB.
                      </p>
                    </>
                  )}
                </button>
                {selectedFileName ? (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => {
                        applyInvoiceFile(undefined);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      Remover arquivo
                    </Button>
                  </div>
                ) : null}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : null}

            {documentChoice === 'request-invoice' ? (
              <p className="text-sm text-muted-foreground">
                Ao confirmar, a NF entra como aguardando compras. Você não
                precisa anexar o arquivo agora.
              </p>
            ) : null}

            {errors.invoiceFile?.message ? (
              <p className="text-sm text-destructive">
                {errors.invoiceFile.message}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Cadastrando…
                  </>
                ) : (
                  <>
                    {documentChoice === 'request-invoice'
                      ? 'Cadastrar e solicitar'
                      : 'Cadastrar NF'}
                    <SendHorizontal className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </FormTimelineStep>
        </ol>
      </form>
    </div>
  );
}

function FormTimelineStep({
  step,
  title,
  description,
  complete,
  optional = false,
  isLast = false,
  children,
}: {
  step: number;
  title: string;
  description: string;
  complete: boolean;
  optional?: boolean;
  isLast?: boolean;
  children: ReactNode;
}) {
  return (
    <li className="relative flex gap-4 pb-10 last:pb-0">
      {isLast ? null : (
        <span
          aria-hidden
          className="absolute top-10 left-4.5 h-[calc(100%-1.25rem)] w-px bg-linear-to-b from-border to-transparent"
        />
      )}
      <div
        className={cn(
          'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-medium',
          complete
            ? 'bg-brand text-brand-foreground'
            : 'bg-muted text-muted-foreground',
        )}
      >
        {complete ? <Check className="size-4" /> : step}
      </div>
      <div className="min-w-0 flex-1 space-y-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">{title}</h2>
            {optional ? (
              <span className="text-xs text-muted-foreground">Opcional</span>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </li>
  );
}

function DocumentChoiceCard({
  selected,
  dimmed = false,
  icon,
  title,
  description,
  onSelect,
}: {
  selected: boolean;
  dimmed?: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex h-full flex-col gap-2 rounded-2xl px-4 py-4 text-left transition-[colors,opacity]',
        selected
          ? 'bg-brand-muted text-foreground'
          : 'bg-muted/50 text-foreground hover:bg-muted',
        dimmed && 'opacity-40 saturate-50 hover:opacity-55',
      )}
    >
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-xl',
          selected
            ? 'bg-brand text-brand-foreground'
            : 'bg-background text-muted-foreground',
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </span>
    </button>
  );
}
