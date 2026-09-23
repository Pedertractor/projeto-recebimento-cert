import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HttpClientError } from '@/lib/http-client';
import {
  createSupplierFormSchema,
  type CreateSupplierFormValues,
} from '@/schemas/create-supplier.schema';
import { SupplierLogo } from '@/components/suppliers/supplier-logo';
import {
  createSupplier,
  suppliersListQueryKey,
  updateSupplier,
} from '@/services/suppliers/supplier.service';
import type { Supplier } from '@/types/supplier';
import { formatCnpjInput } from '@/utils/cnpj';

type CreateSupplierDialogProps = {
  supplier?: Supplier | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreated?: (supplierId: number) => void;
  trigger?: ReactNode;
};

export function CreateSupplierDialog({
  supplier,
  open: controlledOpen,
  onOpenChange,
  onCreated,
  trigger,
}: CreateSupplierDialogProps) {
  const queryClient = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const isEditing = Boolean(supplier);
  const formId = isEditing
    ? `supplier-form-${supplier?.id}`
    : 'supplier-form-create';

  const setOpen = (next: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateSupplierFormValues>({
    resolver: zodResolver(createSupplierFormSchema),
    defaultValues: {
      name: supplier?.name ?? '',
      cnpj: supplier?.cnpj ?? '',
      description: supplier?.description ?? '',
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      name: supplier?.name ?? '',
      cnpj: supplier?.cnpj ?? '',
      description: supplier?.description ?? '',
    });
    setLogoFile(null);
    setRemoveLogo(false);
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoPreviewUrl(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  }, [open, reset, supplier]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  const supplierName = watch('name');

  const displayedLogoPath =
    removeLogo || logoPreviewUrl
      ? null
      : (supplier?.logoStoragePath ?? null);

  const mutation = useMutation({
    mutationFn: (values: CreateSupplierFormValues) => {
      const options = {
        logoFile,
        removeLogo: isEditing ? removeLogo : false,
      };

      return isEditing && supplier
        ? updateSupplier(supplier.id, values, options)
        : createSupplier(values, options);
    },
    onSuccess: (saved) => {
      toast.success(
        isEditing ? 'Fornecedor atualizado.' : 'Fornecedor cadastrado.',
      );
      void queryClient.invalidateQueries({ queryKey: suppliersListQueryKey });
      onCreated?.(saved.id);
      if (!isEditing) {
        reset();
      }
      setOpen(false);
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : isEditing
            ? 'Não foi possível atualizar o fornecedor.'
            : 'Não foi possível cadastrar o fornecedor.';
      toast.error(message);
    },
  });

  if (isControlled && !open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      {!trigger && !isControlled ? (
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-2">
            <Plus className="size-4" />
            Novo fornecedor
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-brand" />
            {isEditing ? 'Editar fornecedor' : 'Cadastrar fornecedor'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados do fornecedor de chapas.'
              : 'Informe os dados do fornecedor de chapas para usar nas solicitações.'}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-name`}>Nome</Label>
            <Input id={`${formId}-name`} {...register('name')} />
            {errors.name?.message ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-cnpj`}>CNPJ</Label>
            <Input
              id={`${formId}-cnpj`}
              inputMode="numeric"
              placeholder="00.000.000/0000-00"
              {...register('cnpj')}
              onChange={(event) =>
                setValue('cnpj', formatCnpjInput(event.target.value), {
                  shouldValidate: true,
                })
              }
            />
            {errors.cnpj?.message ? (
              <p className="text-sm text-destructive">{errors.cnpj.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-description`}>Descrição</Label>
            <Input
              id={`${formId}-description`}
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${formId}-logo`}>Logo (opcional)</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="size-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-border">
                {logoPreviewUrl ? (
                  <img
                    src={logoPreviewUrl}
                    alt=""
                    className="size-full object-contain"
                  />
                ) : (
                  <SupplierLogo
                    name={supplierName || supplier?.name || 'Fornecedor'}
                    logoStoragePath={displayedLogoPath}
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <ImagePlus className="size-4" />
                  {displayedLogoPath || logoPreviewUrl
                    ? 'Trocar logo'
                    : 'Enviar logo'}
                </Button>
                {displayedLogoPath || logoPreviewUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => {
                      setLogoFile(null);
                      setRemoveLogo(true);
                      if (logoPreviewUrl) {
                        URL.revokeObjectURL(logoPreviewUrl);
                        setLogoPreviewUrl(null);
                      }
                      if (logoInputRef.current) {
                        logoInputRef.current.value = '';
                      }
                    }}
                  >
                    <Trash2 className="size-4" />
                    Remover
                  </Button>
                ) : null}
              </div>
              <input
                ref={logoInputRef}
                id={`${formId}-logo`}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }
                  setLogoFile(file);
                  setRemoveLogo(false);
                  if (logoPreviewUrl) {
                    URL.revokeObjectURL(logoPreviewUrl);
                  }
                  setLogoPreviewUrl(URL.createObjectURL(file));
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              PNG ou JPEG, até 2 MB. Aparece na visualização da NF.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
