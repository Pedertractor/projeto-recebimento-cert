import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, FileText, Loader2, Pencil, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { CreateSupplierDialog } from '@/components/suppliers/create-supplier-dialog';
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

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoCard
            label="NF"
            onBrand
            onEdit={canEdit ? () => setEditField('invoiceNumber') : undefined}
            editLabel="Editar número da NF"
          >
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="text-2xl font-semibold">{request.invoiceNumber}</p>
              <RequestStatusBadge status={request.status} />
            </div>
          </InfoCard>
          <InfoCard
            label="Data NF"
            onBrand
            onEdit={canEdit ? () => setEditField('invoiceDate') : undefined}
            editLabel="Editar data da NF"
          >
            <p className="mt-1 text-2xl font-semibold">
              {formatRequestDate(request.invoiceDate)}
            </p>
          </InfoCard>
        </div>
        <InfoCard
          label="Certificados"
          onBrand
          className="lg:min-w-44"
          onEdit={canEdit ? () => setEditField('lots') : undefined}
          editLabel="Editar quantidade de lotes"
        >
          <p className="mt-1 text-2xl font-semibold">
            {request.expectedCertificates}
          </p>
        </InfoCard>
      </div>

      <div className="rounded-2xl bg-card px-5 py-4 shadow-sm ring-1 ring-border/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Fornecedor
              </p>
              {canEdit ? (
                <EditPencilButton
                  onClick={() => setEditField('supplier')}
                  label="Editar fornecedor"
                />
              ) : null}
            </div>
            <p className="font-medium">{request.supplier.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatCnpjInput(request.supplier.cnpj)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Qtd de lotes: {request.expectedCertificates}
            </p>
            {canEdit ? (
              <EditPencilButton
                onClick={() => setEditField('lots')}
                label="Editar quantidade de lotes"
              />
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4 shadow-sm ring-1 ring-border/60">
        <div className="flex min-w-0 items-center gap-3">
          <FileText className="size-5 shrink-0 text-brand" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {qualityDocument?.displayName ?? 'Documento de qualidade'}
            </p>
            <p className="text-xs text-muted-foreground">
              {request.qualityDocumentLocked
                ? 'Versão vinculada a esta NF após conclusão das conferências'
                : 'Versão atual usada na conferência'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!request.qualityDocumentLocked ? (
            <Button
              asChild
              variant="ghost"
              size="icon-xs"
              aria-label="Atualizar documento de qualidade"
            >
              <Link to="/doc-qualidade">
                <Pencil className="size-3.5" />
              </Link>
            </Button>
          ) : null}
          {qualityDocument ? (
            <Button asChild variant="outline" size="sm">
              <a
                href={resolveAttachmentUrl(qualityDocument.storagePath)}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="size-4" />
                Abrir
              </a>
            </Button>
          ) : null}
        </div>
      </div>

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

function InfoCard({
  label,
  children,
  onBrand = false,
  className,
  onEdit,
  editLabel,
}: {
  label: string;
  children: ReactNode;
  onBrand?: boolean;
  className?: string;
  onEdit?: () => void;
  editLabel?: string;
}) {
  return (
    <div
      className={cn(
        'relative rounded-2xl px-5 py-4 shadow-sm',
        onBrand ? 'bg-brand text-brand-foreground' : 'bg-card',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            'text-xs uppercase tracking-wide',
            onBrand ? 'opacity-80' : 'text-muted-foreground',
          )}
        >
          {label}
        </p>
        {onEdit ? (
          <EditPencilButton
            onClick={onEdit}
            label={editLabel ?? `Editar ${label}`}
            onBrand={onBrand}
          />
        ) : null}
      </div>
      {children}
    </div>
  );
}

function EditPencilButton({
  onClick,
  label,
  onBrand = false,
}: {
  onClick: () => void;
  label: string;
  onBrand?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className={cn(
        onBrand &&
          'text-brand-foreground/80 hover:bg-white/15 hover:text-brand-foreground',
      )}
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
