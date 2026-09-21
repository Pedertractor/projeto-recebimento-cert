import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus } from 'lucide-react';
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
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
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
  }, [open, reset, supplier]);

  const mutation = useMutation({
    mutationFn: (values: CreateSupplierFormValues) =>
      isEditing && supplier
        ? updateSupplier(supplier.id, values)
        : createSupplier(values),
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
