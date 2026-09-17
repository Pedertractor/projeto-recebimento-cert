import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
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
import { HttpClientError } from '@/lib/http-client';
import {
  updateMyEmail,
  webSessionQueryKey,
} from '@/services/auth/auth.service';

const updateUserEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe o e-mail.')
    .email('Informe um e-mail válido.'),
});

type UpdateUserEmailFormValues = z.infer<typeof updateUserEmailSchema>;

type UpdateUserEmailDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  required?: boolean;
  currentEmail?: string | null;
};

export function UpdateUserEmailDialog({
  open,
  onOpenChange,
  required = false,
  currentEmail,
}: UpdateUserEmailDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserEmailFormValues>({
    resolver: zodResolver(updateUserEmailSchema),
    defaultValues: {
      email: currentEmail ?? '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({ email: currentEmail ?? '' });
    }
  }, [currentEmail, open, reset]);

  const mutation = useMutation({
    mutationFn: (values: UpdateUserEmailFormValues) =>
      updateMyEmail({ email: values.email.trim() }),
    onSuccess: async () => {
      toast.success('E-mail atualizado.');
      await queryClient.invalidateQueries({ queryKey: webSessionQueryKey });
      onOpenChange?.(false);
    },
    onError: (error) => {
      const message =
        error instanceof HttpClientError
          ? error.message
          : 'Não foi possível atualizar o e-mail.';
      toast.error(message);
    },
  });

  function handleOpenChange(nextOpen: boolean): void {
    if (required && !nextOpen) {
      return;
    }

    onOpenChange?.(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="border-0 shadow-xl ring-0 sm:max-w-md"
        showCloseButton={!required}
        onInteractOutside={(event) => {
          if (required) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (required) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {required ? 'Adicione o seu e-mail' : 'Atualizar e-mail'}
          </DialogTitle>
          <DialogDescription>
            {required
              ? 'Para continuar, informe um e-mail válido. Ele será usado para notificações do sistema.'
              : 'Altere o e-mail usado para notificações do sistema.'}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="space-y-1.5">
            <Label htmlFor="userEmail">E-mail</Label>
            <Input
              id="userEmail"
              type="email"
              autoComplete="email"
              placeholder="seu.email@empresa.com.br"
              {...register('email')}
            />
            {errors.email?.message ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <DialogFooter>
            {!required ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
            ) : null}
            <Button
              type="submit"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Mail className="size-4" />
              )}
              Salvar e-mail
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
