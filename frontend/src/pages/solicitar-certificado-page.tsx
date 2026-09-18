import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileUp, Loader2, SendHorizontal } from 'lucide-react';
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
import {
  createCertificateRequestFormSchema,
  type CreateCertificateRequestFormValues,
} from '@/schemas/create-certificate-request.schema';
import {
  certificateRequestsListQueryKey,
  createCertificateRequest,
} from '@/services/certificate-requests/certificate-request.service';
import {
  listSuppliers,
  suppliersListQueryKey,
} from '@/services/suppliers/supplier.service';

export function SolicitarCertificadoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const supplierAnchorRef = useComboboxAnchor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

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
  const invoiceDate = watch('invoiceDate');

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => supplier.id === supplierId) ?? null,
    [supplierId, suppliers],
  );

  const mutation = useMutation({
    mutationFn: createCertificateRequest,
    onSuccess: (request) => {
      toast.success(`Solicitação #${request.id} enviada ao compras.`);
      void queryClient.invalidateQueries({
        queryKey: certificateRequestsListQueryKey,
      });
      navigate('/minhas-solicitacoes');
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : 'Não foi possível enviar a solicitação.';
      toast.error(message);
    },
  });

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFileName(null);
      setValue('invoiceFile', undefined, { shouldValidate: true });
      return;
    }

    setValue('invoiceFile', file, { shouldValidate: true });
    setSelectedFileName(file.name);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Solicitar certificado
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Abra uma solicitação quando a NF chegar sem os certificados
            necessários para conferência.
          </p>
        </div>
        <CreateSupplierDialog
          onCreated={(id) =>
            setValue('supplierId', id, { shouldValidate: true })
          }
        />
      </div>

      <form
        className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="space-y-1.5">
          <Label>Fornecedor</Label>
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
          {errors.supplierId?.message ? (
            <p className="text-sm text-destructive">
              {errors.supplierId.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
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

          <div className="space-y-1.5">
            <Label htmlFor="expectedCertificates">Lotes na NF</Label>
            <Input
              id="expectedCertificates"
              type="number"
              min={1}
              max={99}
              {...register('expectedCertificates', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Observações</Label>
          <Input
            id="notes"
            placeholder="Informações adicionais para o compras (opcional)"
            {...register('notes')}
          />
        </div>

        <div className="space-y-2">
          <Label>Anexo da NF (opcional)</Label>
          <div className="flex flex-col gap-3 rounded-xl border border-dashed border-brand/40 bg-brand-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-brand text-brand-foreground">
                <FileUp className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {selectedFileName ?? 'Selecione o arquivo da nota fiscal'}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF ou imagem, até 10 MB. Referência para o compras — a NF
                  usada na conferência será anexada na resposta.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Escolher arquivo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {errors.invoiceFile?.message ? (
            <p className="text-sm text-destructive">
              {errors.invoiceFile.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando…
              </>
            ) : (
              <>
                Enviar solicitação
                <SendHorizontal className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
