import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { HttpClientError } from '@/lib/http-client';
import { roleLabel } from '@/lib/user-labels';
import {
  activateUser,
  inactivateUser,
  listUserRoles,
  listUsers,
  resetUserPassword,
  updateUserRole,
  userRolesQueryKey,
  usersListQueryKey,
} from '@/services/users/user.service';
import type { PublicUser, UserRole } from '@/types/user';
import type { Unit } from '@/types/unit';

export type RoleFilterOption = UserRole | 'all';
export type UnitFilterOption = Unit | 'all';
export type StatusFilterOption = 'all' | 'active' | 'inactive';

export function roleFilterLabel(value: RoleFilterOption): string {
  return value === 'all' ? 'Todos' : roleLabel(value);
}

export function useUsersPage() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterCard, setFilterCard] = useState('');
  const [filteredRole, setFilteredRole] = useState<RoleFilterOption>('all');
  const [unit, setUnit] = useState<UnitFilterOption>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('all');
  const [animateSpin, setAnimateSpin] = useState(false);

  const usersQuery = useQuery({
    queryKey: usersListQueryKey,
    queryFn: listUsers,
  });

  const rolesQuery = useQuery({
    queryKey: userRolesQueryKey,
    queryFn: listUserRoles,
  });

  const roles = rolesQuery.data ?? ([
    'STOCK_OPERATOR',
    'PURCHASE_OPERATOR',
    'SUPERADMIN',
  ] as UserRole[]);
  const roleOptions: RoleFilterOption[] = useMemo(
    () => ['all', ...roles],
    [roles],
  );

  const filteredUsers = useMemo(() => {
    const nameQuery = filterName.trim().toLowerCase();
    const cardQuery = filterCard.trim().toLowerCase();
    const users = usersQuery.data ?? [];

    return users.filter((user) => {
      if (nameQuery && !(user.name ?? '').toLowerCase().includes(nameQuery)) {
        return false;
      }

      if (cardQuery && !user.cardNumber.toLowerCase().includes(cardQuery)) {
        return false;
      }

      if (unit !== 'all' && user.unit !== unit) {
        return false;
      }

      if (filteredRole !== 'all' && user.role !== filteredRole) {
        return false;
      }

      if (statusFilter === 'active' && !user.status) {
        return false;
      }

      if (statusFilter === 'inactive' && user.status) {
        return false;
      }

      return true;
    });
  }, [
    usersQuery.data,
    filterName,
    filterCard,
    unit,
    filteredRole,
    statusFilter,
  ]);

  const activeFiltersCount = [
    filterName.trim(),
    filterCard.trim(),
    filteredRole !== 'all',
    unit !== 'all',
    statusFilter !== 'all',
  ].filter(Boolean).length;

  const filtersSummary =
    activeFiltersCount > 0
      ? `${activeFiltersCount} filtro(s) ativo(s) · ${filteredUsers.length} resultado(s)`
      : `${filteredUsers.length} usuário(s) listado(s)`;

  const resetFilters = useCallback(() => {
    setAnimateSpin(true);
    setFilterName('');
    setFilterCard('');
    setFilteredRole('all');
    setUnit('all');
    setStatusFilter('all');
    window.setTimeout(() => setAnimateSpin(false), 400);
  }, []);

  const handleSelectRole = useCallback((value: RoleFilterOption | null) => {
    setFilteredRole(value ?? 'all');
  }, []);

  function invalidateUsers() {
    void queryClient.invalidateQueries({ queryKey: usersListQueryKey });
  }

  function handleMutationError(error: unknown, fallback: string) {
    const message =
      error instanceof HttpClientError ? error.message : fallback;
    toast.error(message);
  }

  const resetMutation = useMutation({
    mutationFn: resetUserPassword,
    onSuccess: (_data, userId) => {
      toast.success('Senha resetada. A nova senha é o número do cartão.');
      invalidateUsers();
      setSelectedUser((current) =>
        current?.id === userId
          ? { ...current, firstLogin: true }
          : current,
      );
    },
    onError: (error) =>
      handleMutationError(error, 'Não foi possível resetar a senha.'),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: UserRole }) =>
      updateUserRole(userId, role),
    onSuccess: (_data, variables) => {
      toast.success('Perfil atualizado.');
      invalidateUsers();
      setSelectedUser((current) =>
        current?.id === variables.userId
          ? { ...current, role: variables.role }
          : current,
      );
    },
    onError: (error) =>
      handleMutationError(error, 'Não foi possível alterar o perfil.'),
  });

  const statusMutation = useMutation({
    mutationFn: async (user: PublicUser) => {
      if (user.status) {
        await inactivateUser(user.id);
        return false;
      }
      await activateUser(user.id);
      return true;
    },
    onSuccess: (status, user) => {
      toast.success(status ? 'Usuário ativado.' : 'Usuário inativado.');
      invalidateUsers();
      setSelectedUser((current) =>
        current?.id === user.id ? { ...current, status } : current,
      );
    },
    onError: (error) =>
      handleMutationError(error, 'Não foi possível alterar o status.'),
  });

  function openUserDialog(user: PublicUser) {
    setSelectedUser(user);
    setDialogOpen(true);
  }

  return {
    usersQuery,
    roles,
    roleOptions,
    filteredUsers,
    filterName,
    setFilterName,
    filterCard,
    setFilterCard,
    filteredRole,
    setFilteredRole,
    handleSelectRole,
    unit,
    setUnit,
    statusFilter,
    setStatusFilter,
    resetFilters,
    animateSpin,
    filtersSummary,
    activeFiltersCount,
    selectedUser,
    dialogOpen,
    setDialogOpen,
    openUserDialog,
    resetPassword: (user: PublicUser) => resetMutation.mutate(user.id),
    changeRole: (user: PublicUser, role: UserRole) =>
      roleMutation.mutate({ userId: user.id, role }),
    toggleStatus: (user: PublicUser) => statusMutation.mutate(user),
    isResetting: resetMutation.isPending,
    isUpdatingRole: roleMutation.isPending,
    isUpdatingStatus: statusMutation.isPending,
  };
}
