import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
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
  createProductTypeFormSchema,
  type CreateProductTypeFormValues,
} from '@/schemas/create-product-type.schema';
import {
  createProductType,
  productTypesListQueryKey,
  productTypeOptionsQueryKey,
} from '@/services/product-types/product-type.service';

type CreateProductTypeDialogProps = {
  trigger?: ReactNode;
};

export function CreateProductTypeDialog({
  trigger,
}: CreateProductTypeDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductTypeFormValues>({
    resolver: zodResolver(createProductTypeFormSchema),
    defaultValues: {
      name: '',
      code: '',
    },
  });

  const mutation = useMutation({
    mutationFn: createProductType,
    onSuccess: async (productType) => {
      toast.success(`Tipo "${productType.name}" cadastrado.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productTypesListQueryKey }),
        queryClient.invalidateQueries({ queryKey: productTypeOptionsQueryKey }),
      ]);
      reset();
      setOpen(false);
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : 'Não foi possível cadastrar o tipo.';
      toast.error(message);
    },
  });

  function onSubmit(values: CreateProductTypeFormValues): void {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" className="bg-brand text-brand-foreground">
            <Plus className="size-4" />
            Novo tipo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo tipo de produto</DialogTitle>
          <DialogDescription>
            Depois de criar, publique o documento de qualidade deste tipo em Doc
            qualidade.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label htmlFor="product-type-name">Nome</Label>
            <Input
              id="product-type-name"
              placeholder="Ex.: Tubo"
              {...register('name')}
            />
            {errors.name?.message ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-type-code">Código</Label>
            <Input
              id="product-type-code"
              placeholder="Ex.: TUBO"
              className="font-mono uppercase"
              {...register('code')}
            />
            {errors.code?.message ? (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Cadastrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
