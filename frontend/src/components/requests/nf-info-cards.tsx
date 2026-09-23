import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, FileText, Loader2, Pencil, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { CreateSupplierDialog } from '@/components/suppliers/create-supplier-dialog';
import { SupplierLogo } from '@/components/suppliers/supplier-logo';
import { RequestStatusBadge } from '@/components/requests/request-status-badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatRequestDate } from '@/lib/certificate-request-labels';
import { HttpClientError } from '@/lib/http-client';
import { cn } from '@/lib/utils';
import {
  certificateRequestDetailQueryKey,
  certificateRequestsListQueryKey,
  completedCertificateRequestsQueryKey,
  purchaseCertificateRequestsListQueryKey,
  updateCertificateRequest,
} from '@/services/certificate-requests/certificate-request.service';
import {
  listSuppliers,
  suppliersListQueryKey,
} from '@/services/suppliers/supplier.service';
import type {
  CertificateRequest,
  UpdateCertificateRequestPayload,
} from '@/types/certificate-request';
import type { QualityDocument } from '@/types/quality-document';
import { formatCnpjInput } from '@/utils/cnpj';
import { resolveAttachmentUrl } from '@/utils/attachment-url';

type EditField = 'invoiceNumber' | 'invoiceDate' | 'lots' | 'supplier';

type NfInfoCardsProps = {
  request: CertificateRequest;
  qualityDocument?: QualityDocument;
};

export function NfInfoCards({ request, qualityDocument }: NfInfoCardsProps) {
  const queryClient = useQueryClient();
  const [editField, setEditField] = useState<EditField | null>(null);
  const canEdit = request.status !== 'CANCELADA';

  const mutation = useMutation({
    mutationFn: (payload: UpdateCertificateRequestPayload) =>
      updateCertificateRequest(request.id, payload),
    onSuccess: async () => {
      toast.success('Informações da NF atualizadas.');
      setEditField(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: certificateRequestDetailQueryKey(request.id),
        }),
        queryClient.invalidateQueries({
          queryKey: certificateRequestsListQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: completedCertificateRequestsQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: purchaseCertificateRequestsListQueryKey,
        }),
      ]);
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : 'Não foi possível atualizar a NF.';
      toast.error(message);
    },
  });

  const qualityDocHint = request.qualityDocumentLocked
    ? 'Versão vinculada após concluir as conferências'
    : 'Versão usada nas conferências desta NF';

  return (
    <>
      <section className="min-w-0 border-b border-border pb-6">
        <header className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Identificação da nota
          </p>
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
            <h1 className="min-w-0 break-all text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {request.invoiceNumber}
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <RequestStatusBadge status={request.status} />
              {canEdit ? (
                <EditPencilButton
                  onClick={() => setEditField('invoiceNumber')}
                  label="Editar número da NF"
                />
              ) : null}
            </div>
          </div>
        </header>

        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 sm:gap-x-10">
          <NfInfoField
            label="Data de emissão"
            onEdit={canEdit ? () => setEditField('invoiceDate') : undefined}
            editLabel="Editar data da NF"
          >
            {formatRequestDate(request.invoiceDate)}
          </NfInfoField>
          <NfInfoField
            label="Lotes / certificados"
            onEdit={canEdit ? () => setEditField('lots') : undefined}
            editLabel="Editar quantidade de lotes"
          >
            {request.expectedCertificates}
          </NfInfoField>
          <NfInfoField label="Solicitação" className="col-span-2 sm:col-span-1">
            #{request.id}
          </NfInfoField>
        </dl>

        <div className="mt-6 border-t border-border/60 pt-5">
          <div className="flex items-start gap-4">
            <div className="size-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/70 sm:size-16">
              <SupplierLogo
                name={request.supplier.name}
                logoStoragePath={request.supplier.logoStoragePath}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Fornecedor
                </p>
                {canEdit ? (
                  <EditPencilButton
                    onClick={() => setEditField('supplier')}
                    label="Editar fornecedor"
                  />
                ) : null}
              </div>
              <p className="mt-1 text-base font-semibold leading-snug">
                {request.supplier.name}
              </p>
              <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                {formatCnpjInput(request.supplier.cnpj)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <FileText
              className="mt-0.5 size-5 shrink-0 text-brand"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug">
                {qualityDocument?.displayName ?? 'Documento de qualidade'}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {qualityDocHint}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:pl-4">
            {!request.qualityDocumentLocked ? (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-muted-foreground"
              >
                <Link to="/doc-qualidade">
                  <Pencil className="size-3.5" />
                  Gerenciar versões
                </Link>
              </Button>
            ) : null}
            {qualityDocument ? (
              <Button asChild variant="outline" size="sm" className="h-9">
                <a
                  href={resolveAttachmentUrl(qualityDocument.storagePath)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-4" />
                  Abrir PDF
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <NfEditDialog
        request={request}
        field={editField}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) {
            setEditField(null);
          }
        }}
        isPending={mutation.isPending}
        onSave={(payload) => mutation.mutate(payload)}
      />
    </>
  );
}

function NfInfoField({
  label,
  children,
  onEdit,
  editLabel,
  className,
}: {
  label: string;
  children: ReactNode;
  onEdit?: () => void;
  editLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex items-center gap-1">
        <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        {onEdit ? (
          <EditPencilButton
            onClick={onEdit}
            label={editLabel ?? `Editar ${label}`}
          />
        ) : null}
      </div>
      <dd className="mt-1 text-lg font-semibold tabular-nums tracking-tight sm:text-xl">
        {children}
      </dd>
    </div>
  );
}

function EditPencilButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className="size-7 text-muted-foreground hover:text-foreground"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <Pencil className="size-3.5" />
    </Button>
  );
}

function NfEditDialog({
  request,
  field,
  onOpenChange,
  isPending,
  onSave,
}: {
  request: CertificateRequest;
  field: EditField | null;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onSave: (payload: UpdateCertificateRequestPayload) => void;
}) {
  const supplierAnchorRef = useComboboxAnchor();
  const [invoiceNumber, setInvoiceNumber] = useState(request.invoiceNumber);
  const [invoiceDate, setInvoiceDate] = useState(request.invoiceDate);
  const [lots, setLots] = useState(String(request.expectedCertificates));
  const [supplierId, setSupplierId] = useState(request.supplier.id);

  const suppliersQuery = useQuery({
    queryKey: suppliersListQueryKey,
    queryFn: () => listSuppliers(),
    enabled: field === 'supplier',
  });
  const suppliers = suppliersQuery.data ?? [];

  useEffect(() => {
    if (!field) {
      return;
    }
    setInvoiceNumber(request.invoiceNumber);
    setInvoiceDate(request.invoiceDate);
    setLots(String(request.expectedCertificates));
    setSupplierId(request.supplier.id);
  }, [field, request]);

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => supplier.id === supplierId) ?? null,
    [supplierId, suppliers],
  );

  const titles: Record<EditField, { title: string; description: string }> = {
    invoiceNumber: {
      title: 'Editar número da NF',
      description: 'Atualize o número que aparece na nota fiscal.',
    },
    invoiceDate: {
      title: 'Editar data da NF',
      description: 'Atualize a data de emissão da nota fiscal.',
    },
    lots: {
      title: 'Editar quantidade de lotes',
      description:
        'A quantidade de certificados deve corresponder aos lotes da NF.',
    },
    supplier: {
      title: 'Editar fornecedor',
      description: 'Altere o fornecedor vinculado a esta nota fiscal.',
    },
  };

  function handleSave(): void {
    if (field === 'invoiceNumber') {
      const value = invoiceNumber.trim();
      if (!value) {
        toast.error('Informe o número da nota fiscal.');
        return;
      }
      onSave({ invoiceNumber: value });
      return;
    }

    if (field === 'invoiceDate') {
      if (!invoiceDate) {
        toast.error('Informe a data da NF.');
        return;
      }
      onSave({ invoiceDate });
      return;
    }

    if (field === 'lots') {
      const value = Number(lots);
      if (!Number.isInteger(value) || value < 1 || value > 99) {
        toast.error('Informe uma quantidade de lotes entre 1 e 99.');
        return;
      }
      onSave({ expectedCertificates: value });
      return;
    }

    if (field === 'supplier') {
      if (!supplierId) {
        toast.error('Selecione um fornecedor.');
        return;
      }
      onSave({ supplierId });
    }
  }

  return (
    <Dialog open={field !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {field ? (
          <>
            <DialogHeader>
              <DialogTitle>{titles[field].title}</DialogTitle>
              <DialogDescription>{titles[field].description}</DialogDescription>
            </DialogHeader>

            {field === 'invoiceNumber' ? (
              <div className="space-y-1.5">
                <Label htmlFor="edit-invoice-number">Número da NF</Label>
                <Input
                  id="edit-invoice-number"
                  value={invoiceNumber}
                  onChange={(event) => setInvoiceNumber(event.target.value)}
                  autoFocus
                />
              </div>
            ) : null}

            {field === 'invoiceDate' ? (
              <DatePickerField
                label="Data da NF"
                value={invoiceDate}
                onChange={setInvoiceDate}
              />
            ) : null}

            {field === 'lots' ? (
              <div className="max-w-40 space-y-1.5">
                <Label htmlFor="edit-lots">Quantidade de lotes</Label>
                <Input
                  id="edit-lots"
                  type="number"
                  min={1}
                  max={99}
                  value={lots}
                  onChange={(event) => setLots(event.target.value)}
                />
              </div>
            ) : null}

            {field === 'supplier' ? (
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Combobox
                  items={suppliers}
                  value={selectedSupplier}
                  onValueChange={(supplier) =>
                    setSupplierId(supplier?.id ?? 0)
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
                    className="z-110 w-(--anchor-width)"
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
                  onCreated={setSupplierId}
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
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="button" disabled={isPending} onClick={handleSave}>
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Salvar
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
