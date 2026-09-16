import { useState } from 'react';
import {
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  LockKeyhole,
} from 'lucide-react';

import { APP_LOGO_SRC, BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LoginFlowStep } from '@/hooks/auth/use-login-page';
import { cn } from '@/lib/utils';
import { UNITS, UNIT_LABELS, type Unit } from '@/types/unit';

type LoginFormProps = {
  flowStep: LoginFlowStep;
  cardNumber: string;
  password: string;
  unit: Unit;
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  errorMessage: string | null;
  infoMessage: string | null;
  onCardNumberChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onUnitChange: (value: Unit) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onBackToCredentials?: () => void;
};

export function LoginForm({
  flowStep,
  cardNumber,
  password,
  unit,
  newPassword,
  confirmPassword,
  isLoading,
  errorMessage,
  infoMessage,
  onCardNumberChange,
  onPasswordChange,
  onUnitChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onBackToCredentials,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isFirstLoginStep = flowStep === 'firstLoginPassword';

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background p-3 sm:p-4">
      <div
        className={cn(
          'flex w-full max-w-[min(100%,22rem)] flex-col gap-4 sm:max-w-md',
          'lg:max-h-[min(100dvh-1.5rem,36rem)] lg:max-w-4xl lg:flex-row lg:gap-0 lg:overflow-hidden lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:shadow-md',
        )}
      >
        <div
          className={cn(
            'relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-soft to-brand py-5 shadow-md sm:py-6',
            'lg:w-[38%] lg:rounded-none lg:py-0 lg:shadow-none',
          )}
        >
          <BrandMark
            logoSrc={APP_LOGO_SRC}
            alt="Certificado de Qualidade"
            className="h-28 w-48 sm:h-32 sm:w-56 lg:h-56 lg:w-[18rem]"
          />
          <p className="absolute inset-x-4 bottom-5 hidden text-center text-xs font-normal tracking-wide text-white/75 lg:block">
            Solicitação de certificados · Pedertractor &amp; TractorComponents
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-1 lg:justify-center lg:gap-5 lg:p-8 xl:px-10">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {isFirstLoginStep ? 'Troca de senha' : 'Login'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isFirstLoginStep
                ? 'Defina uma nova senha para concluir o primeiro acesso.'
                : 'Acesse o Certificado de Qualidade.'}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3.5"
            noValidate
          >
            {infoMessage ? (
              <p className="rounded-lg border border-brand/30 bg-brand-muted/40 px-3 py-2 text-sm text-foreground">
                {infoMessage}
              </p>
            ) : null}

            {errorMessage ? (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            ) : null}

            {!isFirstLoginStep ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="cardNumber">Cartão</Label>
                  <div className="relative">
                    <CreditCard
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id="cardNumber"
                      inputMode="numeric"
                      autoComplete="username"
                      placeholder="Digite o número do cartão"
                      value={cardNumber}
                      onChange={(event) =>
                        onCardNumberChange(event.target.value)
                      }
                      className="h-10 border-border pl-10 placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-sm font-bold text-foreground">
                    Unidade
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {UNITS.map((unitValue) => {
                      const active = unit === unitValue;

                      return (
                        <button
                          key={unitValue}
                          type="button"
                          onClick={() => onUnitChange(unitValue)}
                          className={cn(
                            'h-10 rounded-lg border text-sm font-bold transition-colors',
                            active
                              ? 'border-brand bg-brand text-brand-foreground'
                              : 'border-border bg-background text-foreground hover:bg-muted/60',
                          )}
                        >
                          {UNIT_LABELS[unitValue]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <KeyRound
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id="password"
                      autoComplete="current-password"
                      placeholder="Digite sua senha"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) =>
                        onPasswordChange(event.target.value)
                      }
                      className="h-10 border-border pr-10 pl-10 placeholder:text-muted-foreground"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-brand"
                      aria-label={
                        showPassword ? 'Ocultar senha' : 'Mostrar senha'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden />
                      ) : (
                        <Eye className="size-4" aria-hidden />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <div className="relative">
                    <LockKeyhole
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id="newPassword"
                      autoComplete="new-password"
                      placeholder="Digite a nova senha"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(event) =>
                        onNewPasswordChange(event.target.value)
                      }
                      className="h-10 border-border pr-10 pl-10 placeholder:text-muted-foreground"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword((current) => !current)
                      }
                      className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-brand"
                      aria-label={
                        showNewPassword ? 'Ocultar senha' : 'Mostrar senha'
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff className="size-4" aria-hidden />
                      ) : (
                        <Eye className="size-4" aria-hidden />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <div className="relative">
                    <LockKeyhole
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id="confirmPassword"
                      autoComplete="new-password"
                      placeholder="Confirme a nova senha"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) =>
                        onConfirmPasswordChange(event.target.value)
                      }
                      className="h-10 border-border pr-10 pl-10 placeholder:text-muted-foreground"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-brand"
                      aria-label={
                        showConfirmPassword
                          ? 'Ocultar senha'
                          : 'Mostrar senha'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" aria-hidden />
                      ) : (
                        <Eye className="size-4" aria-hidden />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-10 w-full rounded-lg bg-brand text-sm font-bold tracking-wide text-brand-foreground hover:bg-brand/90"
              >
                <span className="flex-1 text-center">
                  {isLoading
                    ? 'Processando…'
                    : isFirstLoginStep
                      ? 'Salvar nova senha'
                      : 'Entrar'}
                </span>
                <LogIn className="size-4 shrink-0" aria-hidden />
              </Button>

              {isFirstLoginStep && onBackToCredentials ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  className="h-10 w-full rounded-lg"
                  onClick={onBackToCredentials}
                >
                  Voltar
                </Button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
