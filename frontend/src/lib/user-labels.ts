import type { UserRole } from '@/types/user';
import type { Unit } from '@/types/unit';
import { UNIT_LABELS } from '@/types/unit';

export function roleLabel(role: UserRole): string {
  switch (role) {
    case 'SUPERADMIN':
      return 'Super Admin';
    case 'STOCK_OPERATOR':
      return 'Operador de estoque';
    case 'PURCHASE_OPERATOR':
      return 'Operador de compras';
  }
}

export function isSuperAdminRole(role: UserRole | undefined): boolean {
  return role === 'SUPERADMIN';
}

/** @deprecated Use isSuperAdminRole */
export function isAdminLikeRole(role: UserRole | undefined): boolean {
  return isSuperAdminRole(role);
}

export function unitLabel(unit: Unit | string): string {
  return UNIT_LABELS[unit as Unit] ?? unit;
}

/** `firstLogin` true = ainda não concluiu o primeiro acesso (troca de senha). */
export function userSystemAccessLabel(firstLogin: boolean): string {
  return firstLogin ? 'Ainda não acessou' : 'Já acessou';
}
