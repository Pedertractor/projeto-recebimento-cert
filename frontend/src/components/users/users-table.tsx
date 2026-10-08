import { Badge } from '@/components/ui/badge';
import {
  MobileListCard,
  MobileListCardRow,
} from '@/components/ui/mobile-list-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { roleLabel, userSystemAccessLabel } from '@/lib/user-labels';
import type { PublicUser } from '@/types/user';
import { UNIT_LABELS } from '@/types/unit';

type UsersTableProps = {
  users: PublicUser[];
  onRowClick: (user: PublicUser) => void;
};

export function UsersTable({ users, onRowClick }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Nenhum usuário encontrado.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 p-3 md:hidden">
        {users.map((user) => (
          <MobileListCard key={user.id} onClick={() => onRowClick(user)}>
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{user.name ?? '—'}</p>
                <Badge variant={user.status ? 'default' : 'destructive'}>
                  {user.status ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div className="grid gap-2">
                <MobileListCardRow label="Cartão" value={user.cardNumber} />
                <MobileListCardRow
                  label="Unidade"
                  value={UNIT_LABELS[user.unit]}
                />
                <MobileListCardRow label="Matrícula" value={user.employeeId} />
                <MobileListCardRow
                  label="Perfil"
                  value={
                    <Badge variant="secondary">{roleLabel(user.role)}</Badge>
                  }
                />
                <MobileListCardRow
                  label="Acesso ao sistema"
                  value={
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
                  }
                />
              </div>
            </div>
          </MobileListCard>
        ))}
      </div>

      <div className="hidden md:block">
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Cartão</TableHead>
          <TableHead>Unidade</TableHead>
          <TableHead>Matrícula</TableHead>
          <TableHead>Perfil</TableHead>
          <TableHead>Acesso ao sistema</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow
            key={user.id}
            className="cursor-pointer"
            tabIndex={0}
            onClick={() => onRowClick(user)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onRowClick(user);
              }
            }}
          >
            <TableCell className="font-medium">
              {user.name ?? '—'}
            </TableCell>
            <TableCell>{user.cardNumber}</TableCell>
            <TableCell>{UNIT_LABELS[user.unit]}</TableCell>
            <TableCell>{user.employeeId}</TableCell>
            <TableCell>
              <Badge variant="secondary">{roleLabel(user.role)}</Badge>
            </TableCell>
            <TableCell>
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
            </TableCell>
            <TableCell>
              <Badge variant={user.status ? 'default' : 'destructive'}>
                {user.status ? 'Ativo' : 'Inativo'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
      </div>
    </>
  );
}
