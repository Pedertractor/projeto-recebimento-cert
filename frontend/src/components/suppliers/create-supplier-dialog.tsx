import { useState } from 'react';
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
} from '@/services/suppliers/supplier.service';
import { formatCnpjInput } from '@/utils/cnpj';

type CreateSupplierDialogProps = {
  onCreated?: (supplierId: number) => void;
};

export function CreateSupplierDialog({ onCreated }: CreateSupplierDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateSupplierFormValues>({
    resolver: zodResolver(createSupplierFormSchema),
    defaultValues: {
      name: '',
      cnpj: '',
      description: '',
    },
  });

  const mutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: (supplier) => {
      toast.success('Fornecedor cadastrado.');
      void queryClient.invalidateQueries({ queryKey: suppliersListQueryKey });
      onCreated?.(supplier.id);
      reset();
      setOpen(false);
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : 'Não foi possível cadastrar o fornecedor.';
      toast.error(message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <Plus className="size-4" />
          Novo fornecedor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-brand" />
            Cadastrar fornecedor
          </DialogTitle>
          <DialogDescription>
            Informe os dados do fornecedor de chapas para usar nas solicitações.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="space-y-1.5">
            <Label htmlFor="supplier-name">Nome</Label>
            <Input id="supplier-name" {...register('name')} />
            {errors.name?.message ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="supplier-cnpj">CNPJ</Label>
            <Input
              id="supplier-cnpj"
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
            <Label htmlFor="supplier-description">Descrição</Label>
            <Input id="supplier-description" {...register('description')} />
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
