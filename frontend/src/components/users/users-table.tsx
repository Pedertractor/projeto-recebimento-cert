import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { roleLabel } from '@/lib/user-labels';
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Cartão</TableHead>
          <TableHead>Unidade</TableHead>
          <TableHead>Matrícula</TableHead>
          <TableHead>Perfil</TableHead>
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
              <Badge variant={user.status ? 'default' : 'destructive'}>
                {user.status ? 'Ativo' : 'Inativo'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
