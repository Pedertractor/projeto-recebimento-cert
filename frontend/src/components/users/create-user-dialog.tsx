import { User, UserPlus } from 'lucide-react';

import { AccordionLoader } from '@/components/accordion/accordion-loader';
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
import { Separator } from '@/components/ui/separator';
import { useCreateUser } from '@/hooks/users/use-create-user';
import { roleLabel, unitLabel } from '@/lib/user-labels';
import { cn } from '@/lib/utils';

export function CreateUserDialog() {
  const {
    assignableRoles,
    employeeData,
    employeeLoading,
    employeeQueryIsError,
    employeeQueryErrorMessage,
    employeeActive,
    employeeFoundButInactive,
    showNotFound,
    designation,
    cardNumber,
    unit,
    role,
    openDialog,
    setOpenDialog,
    handleSendUserInformations,
    handleSubmit,
    mutationCreateUser,
    register,
    setValue,
    errors,
    isDisabledSubmit,
  } = useCreateUser();

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-0 bg-brand-muted text-sm text-foreground transition-transform duration-150 hover:bg-brand-muted/80 active:scale-95 sm:w-auto sm:hover:scale-[1.02]"
        >
          <UserPlus className="size-4" aria-hidden />
          Adicionar novo usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-[600px] min-w-0 flex-col px-3 py-4 sm:max-h-[min(90vh,720px)] sm:w-full sm:px-6 sm:py-5">
        <DialogHeader className="mb-2 border-b pr-6 pb-3 text-left sm:mb-4 sm:pr-0">
          <DialogTitle className="text-lg font-semibold">
            Criar novo usuário
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Informe o cartão e a unidade para buscar o colaborador
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleSendUserInformations)}
          className="app-scrollbar flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain sm:gap-6"
        >
          <div className="flex w-full min-w-0 flex-col items-stretch gap-3 rounded-xl border border-border p-3 shadow-sm sm:gap-4 sm:p-5">
            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Label className="text-sm font-medium" htmlFor="create-user-card">
                  Cartão
                </Label>
                <Input
                  id="create-user-card"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Digite o cartão"
                  className="text-sm font-normal"
                  maxLength={16}
                  {...register('cardNumber')}
                />
                {errors.cardNumber?.message ? (
                  <p className="text-xs text-destructive">
                    {errors.cardNumber.message}
                  </p>
                ) : null}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Label className="text-sm font-medium">Unidade</Label>
                <div className="flex gap-2">
                  {(['PEDERTRACTOR', 'TRACTOR'] as const).map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setValue('unit', value, { shouldValidate: true })
                      }
                      className={cn(
                        'min-h-9 min-w-0 flex-1 whitespace-normal px-2 text-xs sm:text-sm',
                        unit === value
                          ? 'bg-brand-muted text-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {unitLabel(value)}
                    </Button>
                  ))}
                </div>
                {errors.unit?.message ? (
                  <p className="text-xs text-destructive">{errors.unit.message}</p>
                ) : null}
              </div>
            </div>

            <Separator />

            {employeeLoading && cardNumber?.trim() && unit ? (
              <div className="flex justify-center py-6">
                <AccordionLoader />
              </div>
            ) : null}

            {employeeQueryIsError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-sm font-medium text-destructive">
                  {employeeQueryErrorMessage}
                </p>
              </div>
            ) : null}

            {employeeActive && employeeData ? (
              <div className="flex w-full flex-col gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-900">
                  <User className="size-4 shrink-0" aria-hidden />
                  Colaborador encontrado ({employeeData.name})
                </p>
                {designation ? (
                  <div className="space-y-1 text-sm text-emerald-900/90">
                    <div>Posição: {designation.position.name}</div>
                    <div>Setor: {designation.sector.name}</div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {showNotFound ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-sm font-medium text-destructive">
                  Nenhum colaborador encontrado com esse cartão e unidade.
                </p>
              </div>
            ) : null}

            {employeeFoundButInactive ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-sm font-medium text-destructive">
                  Colaborador inativo ({employeeData?.name}).
                </p>
              </div>
            ) : null}

            <div className="flex w-full flex-col gap-2">
              <Label className="text-sm font-medium">Função na plataforma</Label>
              <div className="flex gap-2">
                {assignableRoles.map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    disabled={!employeeData || !employeeActive}
                    onClick={() =>
                      setValue('role', value, { shouldValidate: true })
                    }
                    className={cn(
                      'min-h-9 min-w-0 flex-1 whitespace-normal px-2 text-xs sm:text-sm',
                      role === value
                        ? 'bg-brand text-brand-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {roleLabel(value)}
                  </Button>
                ))}
              </div>
              {errors.role?.message ? (
                <p className="text-xs text-destructive">{errors.role.message}</p>
              ) : null}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                A senha inicial de acesso é o número do cartão. Após o primeiro
                acesso, o usuário deverá alterá-la.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={isDisabledSubmit}
            className={cn(
              'w-full shrink-0',
              !isDisabledSubmit &&
                'bg-brand text-brand-foreground hover:bg-brand/90',
              isDisabledSubmit &&
                'cursor-not-allowed bg-muted text-muted-foreground',
            )}
          >
            {mutationCreateUser.isPending ? 'Criando...' : 'Criar usuário'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
