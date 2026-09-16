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
    <div className="flex min-h-dvh w-full flex-col lg:flex-row">
      <section className="flex items-center justify-center bg-gradient-to-br from-brand-soft to-brand px-6 py-10 lg:w-1/2 lg:min-h-dvh lg:py-0">
        <div className="flex flex-col items-center gap-5 text-center">
          <BrandMark
            logoSrc={APP_LOGO_SRC}
            alt="Certificado de Qualidade"
            className="h-32 w-52 sm:h-40 sm:w-64 lg:h-72 lg:w-[22rem]"
          />
          <p className="hidden max-w-sm text-sm leading-relaxed text-brand-foreground/80 lg:block">
            Solicitação de certificados · Pedertractor &amp; TractorComponents
          </p>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center bg-background px-4 pb-8 lg:w-1/2 lg:min-h-dvh lg:px-12 lg:py-10">
        <div
          className={cn(
            'w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8',
            'lg:border-white/15 lg:bg-gradient-to-br lg:from-brand-soft lg:to-brand lg:shadow-xl',
          )}
        >
          <div className="space-y-1">
            <h1
              className={cn(
                'text-xl font-bold tracking-tight text-foreground sm:text-2xl',
                'lg:text-brand-foreground',
              )}
            >
              {isFirstLoginStep ? 'Troca de senha' : 'Login'}
            </h1>
            <p
              className={cn(
                'text-sm text-muted-foreground',
                'lg:text-brand-foreground/80',
              )}
            >
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
              <p
                className={cn(
                  'rounded-lg border border-brand/30 bg-brand-muted/40 px-3 py-2 text-sm text-foreground',
                  'lg:border-white/25 lg:bg-white/15 lg:text-brand-foreground',
                )}
              >
                {infoMessage}
              </p>
            ) : null}

            {errorMessage ? (
              <p
                className={cn(
                  'text-sm text-destructive',
                  'lg:rounded-lg lg:border lg:border-red-200/40 lg:bg-red-50/90 lg:px-3 lg:py-2',
                )}
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}

            {!isFirstLoginStep ? (
              <>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="cardNumber"
                    className="lg:text-brand-foreground"
                  >
                    Cartão
                  </Label>
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
                      className="h-10 border-border bg-background pl-10 placeholder:text-muted-foreground lg:border-white/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-sm font-bold text-foreground lg:text-brand-foreground">
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
                              ? 'border-brand bg-brand text-brand-foreground lg:border-white lg:bg-white lg:text-brand'
                              : 'border-border bg-background text-foreground hover:bg-muted/60 lg:border-white/30 lg:bg-white/10 lg:text-brand-foreground lg:hover:bg-white/20',
                          )}
                        >
                          {UNIT_LABELS[unitValue]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="lg:text-brand-foreground"
                  >
                    Senha
                  </Label>
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
                      onChange={(event) => onPasswordChange(event.target.value)}
                      className="h-10 border-border bg-background pr-10 pl-10 placeholder:text-muted-foreground lg:border-white/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-brand lg:hover:bg-white/20 lg:hover:text-brand-foreground"
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
                  <Label
                    htmlFor="newPassword"
                    className="lg:text-brand-foreground"
                  >
                    Nova senha
                  </Label>
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
                      className="h-10 border-border bg-background pr-10 pl-10 placeholder:text-muted-foreground lg:border-white/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((current) => !current)}
                      className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-brand lg:hover:bg-white/20 lg:hover:text-brand-foreground"
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
                  <Label
                    htmlFor="confirmPassword"
                    className="lg:text-brand-foreground"
                  >
                    Confirmar senha
                  </Label>
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
                      className="h-10 border-border bg-background pr-10 pl-10 placeholder:text-muted-foreground lg:border-white/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-brand lg:hover:bg-white/20 lg:hover:text-brand-foreground"
                      aria-label={
                        showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'
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
                className="h-10 w-full rounded-lg bg-brand text-sm font-bold tracking-wide text-brand-foreground hover:bg-brand/90 lg:bg-white lg:text-brand lg:hover:bg-white/90"
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
                  className="h-10 w-full rounded-lg lg:border-white/30 lg:bg-transparent lg:text-brand-foreground lg:hover:bg-white/10"
                  onClick={onBackToCredentials}
                >
                  Voltar
                </Button>
              ) : null}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
