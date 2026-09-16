import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  createUserFormSchema,
  type CreateUserFormValues,
} from '@/schemas/create-user.schema';
import {
  createUser,
  employeeQueryKey,
  fetchEmployeeByCardAndUnitOrNull,
  usersListQueryKey,
} from '@/services/users/user.service';

const CREATE_USER_ROLES = [
  'STOCK_OPERATOR',
  'PURCHASE_OPERATOR',
  'SUPERADMIN',
] as const;

export function useCreateUser() {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [debouncedCard, setDebouncedCard] = useState('');

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      cardNumber: '',
      unit: 'TRACTOR',
      role: 'STOCK_OPERATOR',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = form;

  const cardNumber = watch('cardNumber');
  const unit = watch('unit');
  const role = watch('role');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedCard(cardNumber?.trim() ?? '');
    }, 400);
    return () => window.clearTimeout(timeoutId);
  }, [cardNumber]);

  useEffect(() => {
    if (!openDialog) {
      reset({
        cardNumber: '',
        unit: 'TRACTOR',
        role: 'STOCK_OPERATOR',
      });
      setDebouncedCard('');
    }
  }, [openDialog, reset]);

  const employeeQueryEnabled =
    openDialog && Boolean(unit) && debouncedCard.length > 0;

  const {
    data: employeeData,
    isFetching: employeeLoading,
    isError: employeeQueryIsError,
    error: employeeQueryError,
  } = useQuery({
    queryKey: employeeQueryKey(debouncedCard, unit),
    queryFn: () => fetchEmployeeByCardAndUnitOrNull(debouncedCard, unit),
    enabled: employeeQueryEnabled,
    staleTime: 5 * 60_000,
  });

  const employeeQueryErrorMessage =
    employeeQueryError instanceof Error
      ? employeeQueryError.message
      : 'Não foi possível consultar o colaborador.';

  const mutationCreateUser = useMutation({
    mutationFn: async (data: CreateUserFormValues) =>
      createUser({
        cardNumber: data.cardNumber.trim(),
        unit: data.unit,
        role: data.role,
      }),
    onSuccess: () => {
      toast.success('Usuário criado com sucesso.');
      void queryClient.invalidateQueries({ queryKey: usersListQueryKey });
      setOpenDialog(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const employeeActive =
    employeeData &&
    (employeeData.status === undefined || employeeData.status === true);

  const employeeFoundButInactive = employeeData && employeeData.status === false;

  const showNotFound =
    employeeQueryEnabled &&
    !employeeLoading &&
    !employeeQueryIsError &&
    debouncedCard.length > 0 &&
    employeeData === null;

  const designation = employeeData?.Designation?.[0];

  const isDisabledSubmit =
    mutationCreateUser.isPending ||
    employeeLoading ||
    employeeQueryIsError ||
    !employeeData ||
    !employeeActive;

  return {
    assignableRoles: CREATE_USER_ROLES,
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
    handleSendUserInformations: (data: CreateUserFormValues) =>
      mutationCreateUser.mutate(data),
    handleSubmit,
    mutationCreateUser,
    register,
    setValue,
    errors,
    isDisabledSubmit,
  };
}
