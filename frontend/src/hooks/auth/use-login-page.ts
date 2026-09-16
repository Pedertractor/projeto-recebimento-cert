import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { HttpClientError } from '@/lib/http-client';
import {
  changePassword,
  login,
  webSessionQueryKey,
} from '@/services/auth/auth.service';
import type { PublicUser } from '@/types/user';
import type { Unit } from '@/types/unit';
import { parseCardNumberInput } from '@/utils/card-number';
import { useWebSession } from '@/hooks/auth/use-web-session';

export type LoginFlowStep = 'credentials' | 'firstLoginPassword';

type LoginFormState = {
  cardNumber: string;
  password: string;
  unit: Unit;
  newPassword: string;
  confirmPassword: string;
};

const INITIAL_STATE: LoginFormState = {
  cardNumber: '',
  password: '',
  unit: 'PEDERTRACTOR',
  newPassword: '',
  confirmPassword: '',
};

function resolveLoginErrorMessage(
  message: string,
  flowStep: LoginFlowStep,
): string {
  const normalized = message.toLowerCase();

  if (
    flowStep === 'credentials' &&
    normalized.includes('password') &&
    (normalized.includes('too small') || normalized.includes('>=1'))
  ) {
    return 'Informe a senha.';
  }

  if (
    flowStep === 'firstLoginPassword' &&
    normalized.includes('password') &&
    (normalized.includes('too small') || normalized.includes('>=1'))
  ) {
    return 'Informe a nova senha.';
  }

  return message;
}

export function useLoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: sessionUser,
    isPending: isSessionPending,
    isSuccess,
    isError,
  } = useWebSession();

  const [form, setForm] = useState<LoginFormState>(INITIAL_STATE);
  const [flowStep, setFlowStep] = useState<LoginFlowStep>('credentials');
  const [authenticatedUser, setAuthenticatedUser] = useState<PublicUser | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: login,
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({
      userId,
      password,
    }: {
      userId: number;
      password: string;
    }) => changePassword(userId, { password }),
  });

  const isLoading = loginMutation.isPending || changePasswordMutation.isPending;
  const isCheckingSession = isSessionPending;

  useEffect(() => {
    if (isSessionPending || !isSuccess || !sessionUser) {
      return;
    }

    if (sessionUser.firstLogin) {
      setAuthenticatedUser(sessionUser);
      setForm((current) => ({
        ...current,
        cardNumber: sessionUser.cardNumber,
        unit: sessionUser.unit,
      }));
      setFlowStep('firstLoginPassword');
      setInfoMessage('Troca de senha obrigatória no primeiro acesso.');
      return;
    }

    navigate('/', { replace: true });
  }, [isSessionPending, isSuccess, sessionUser, navigate]);

  function updateField<K extends keyof LoginFormState>(
    key: K,
    value: LoginFormState[K],
  ): void {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function goBackToCredentials(): void {
    setFlowStep('credentials');
    setForm((current) => ({
      ...INITIAL_STATE,
      cardNumber: current.cardNumber,
      unit: current.unit,
    }));
    setErrorMessage(null);
    setInfoMessage(null);
  }

  async function submitCredentials(): Promise<void> {
    const cardNumber = parseCardNumberInput(form.cardNumber);
    if (cardNumber === null) {
      setErrorMessage('Informe um número de cartão válido.');
      return;
    }

    if (!form.password.trim()) {
      setErrorMessage('Informe a senha.');
      return;
    }

    const response = await loginMutation.mutateAsync({
      cardNumber,
      password: form.password,
      unit: form.unit,
    });

    queryClient.setQueryData(webSessionQueryKey, response.user);

    if (response.user.firstLogin) {
      setAuthenticatedUser(response.user);
      setFlowStep('firstLoginPassword');
      setInfoMessage('Troca de senha obrigatória no primeiro acesso.');
      setForm((current) => ({
        ...current,
        newPassword: '',
        confirmPassword: '',
      }));
      return;
    }

    navigate('/', { replace: true });
  }

  async function submitFirstLoginPassword(): Promise<void> {
    if (!form.newPassword.trim()) {
      setErrorMessage('Informe a nova senha.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    const userId = authenticatedUser?.id;
    if (!userId) {
      setErrorMessage('Sessão inválida. Faça login novamente.');
      return;
    }

    const response = await changePasswordMutation.mutateAsync({
      userId,
      password: form.newPassword,
    });

    queryClient.setQueryData(webSessionQueryKey, response.user);
    navigate('/', { replace: true });
  }

  async function submit(): Promise<void> {
    setErrorMessage(null);
    if (flowStep === 'credentials') {
      setInfoMessage(null);
    }

    try {
      if (flowStep === 'firstLoginPassword') {
        await submitFirstLoginPassword();
      } else {
        await submitCredentials();
      }
    } catch (error) {
      if (error instanceof HttpClientError) {
        setErrorMessage(resolveLoginErrorMessage(error.message, flowStep));
      } else {
        setErrorMessage(
          flowStep === 'firstLoginPassword'
            ? 'Falha inesperada ao alterar a senha.'
            : 'Falha inesperada ao fazer login.',
        );
      }
    }
  }

  return {
    isCheckingSession,
    hasExistingSession: isSuccess && !!sessionUser,
    sessionLoadFailed: isError,
    flowStep,
    form,
    isLoading,
    errorMessage,
    infoMessage,
    setCardNumber: (value: string) => updateField('cardNumber', value),
    setPassword: (value: string) => updateField('password', value),
    setUnit: (value: Unit) => updateField('unit', value),
    setNewPassword: (value: string) => updateField('newPassword', value),
    setConfirmPassword: (value: string) => updateField('confirmPassword', value),
    goBackToCredentials,
    submit,
  };
}
