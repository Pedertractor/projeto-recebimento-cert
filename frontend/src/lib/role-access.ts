import { isSuperAdminRole } from '@/lib/user-labels';
import type { UserRole } from '@/types/user';

export function isStockOperatorRole(role: UserRole | undefined): boolean {
  return role === 'STOCK_OPERATOR' || isSuperAdminRole(role);
}

export function canAccessStockModules(role: UserRole | undefined): boolean {
  return isStockOperatorRole(role);
}
