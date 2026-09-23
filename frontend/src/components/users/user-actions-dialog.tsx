import { RotateCcwKey, UserRoundCheck, UserRoundX } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { roleLabel, userSystemAccessLabel } from '@/lib/user-labels';
import type { PublicUser, UserRole } from '@/types/user';
import { UNIT_LABELS } from '@/types/unit';

type UserActionsDialogProps = {
  user: PublicUser | null;
  open: boolean;
  roles: UserRole[];
  isResetting: boolean;
  isUpdatingRole: boolean;
  isUpdatingStatus: boolean;
  onOpenChange: (open: boolean) => void;
  onResetPassword: (user: PublicUser) => void;
  onChangeRole: (user: PublicUser, role: UserRole) => void;
  onToggleStatus: (user: PublicUser) => void;
};

export function UserActionsDialog({
  user,
  open,
  roles,
  isResetting,
  isUpdatingRole,
  isUpdatingStatus,
  onOpenChange,
  onResetPassword,
  onChangeRole,
  onToggleStatus,
}: UserActionsDialogProps) {
  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user.name ?? 'Usuário'}</DialogTitle>
          <DialogDescription>
            Cartão {user.cardNumber} · {UNIT_LABELS[user.unit]} · Matrícula{' '}
            {user.employeeId}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{roleLabel(user.role)}</Badge>
            <Badge variant={user.status ? 'default' : 'destructive'}>
              {user.status ? 'Ativo' : 'Inativo'}
            </Badge>
            <Badge
              variant={user.firstLogin ? 'outline' : 'secondary'}
              className={
                user.firstLogin
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'bg-emerald-100 text-emerald-900'
              }
            >
              {userSystemAccessLabel(user.firstLogin)}
            </Badge>
          </div>

          {user.email ? (
            <p className="text-sm text-muted-foreground">{user.email}</p>
          ) : null}

          <div className="grid gap-2 border-t pt-4">
            <p className="text-sm font-medium">Alterar perfil</p>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <Button
                  key={role}
                  type="button"
                  size="sm"
                  variant={user.role === role ? 'default' : 'outline'}
                  disabled={isUpdatingRole || user.role === role}
                  onClick={() => onChangeRole(user, role)}
                >
                  {roleLabel(role)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isResetting || !user.status}
              onClick={() => onResetPassword(user)}
            >
              <RotateCcwKey />
              Resetar senha
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isUpdatingStatus}
              onClick={() => onToggleStatus(user)}
            >
              {user.status ? <UserRoundX /> : <UserRoundCheck />}
              {user.status ? 'Inativar' : 'Ativar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
