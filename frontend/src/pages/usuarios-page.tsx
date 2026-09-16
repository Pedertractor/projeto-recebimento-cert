import { Loader2Icon } from 'lucide-react';

import { CreateUserDialog } from '@/components/users/create-user-dialog';
import { UserActionsDialog } from '@/components/users/user-actions-dialog';
import { UsersFilters } from '@/components/users/users-filters';
import { UsersTable } from '@/components/users/users-table';
import { Button } from '@/components/ui/button';
import { useUsersPage } from '@/hooks/users/use-users-page';

export function UsuariosPage() {
  const {
    usersQuery,
    roles,
    roleOptions,
    filteredUsers,
    filterName,
    setFilterName,
    filterCard,
    setFilterCard,
    filteredRole,
    handleSelectRole,
    unit,
    setUnit,
    statusFilter,
    setStatusFilter,
    resetFilters,
    animateSpin,
    filtersSummary,
    selectedUser,
    dialogOpen,
    setDialogOpen,
    openUserDialog,
    resetPassword,
    changeRole,
    toggleStatus,
    isResetting,
    isUpdatingRole,
    isUpdatingStatus,
  } = useUsersPage();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os usuários do sistema.
          </p>
        </div>
        <CreateUserDialog />
      </div>

      <UsersFilters
        filterName={filterName}
        filterCard={filterCard}
        filteredRole={filteredRole}
        unit={unit}
        statusFilter={statusFilter}
        roleOptions={roleOptions}
        filtersSummary={filtersSummary}
        animateSpin={animateSpin}
        onFilterNameChange={setFilterName}
        onFilterCardChange={setFilterCard}
        onFilteredRoleChange={handleSelectRole}
        onUnitChange={setUnit}
        onStatusFilterChange={setStatusFilter}
        onReset={resetFilters}
      />

      {usersQuery.isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {usersQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Não foi possível carregar os usuários.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => void usersQuery.refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      ) : null}

      {usersQuery.isSuccess ? (
        <div className="overflow-hidden rounded-lg border">
          <UsersTable users={filteredUsers} onRowClick={openUserDialog} />
        </div>
      ) : null}

      <UserActionsDialog
        user={selectedUser}
        open={dialogOpen}
        roles={roles}
        isResetting={isResetting}
        isUpdatingRole={isUpdatingRole}
        isUpdatingStatus={isUpdatingStatus}
        onOpenChange={setDialogOpen}
        onResetPassword={resetPassword}
        onChangeRole={changeRole}
        onToggleStatus={toggleStatus}
      />
    </div>
  );
}
