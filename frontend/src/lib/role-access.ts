import { isSuperAdminRole } from '@/lib/user-labels';
import type { UserRole } from '@/types/user';

export function isStockOperatorRole(role: UserRole | undefined): boolean {
  return role === 'STOCK_OPERATOR' || isSuperAdminRole(role);
}

export function isPurchaseOperatorRole(role: UserRole | undefined): boolean {
  return role === 'PURCHASE_OPERATOR' || isSuperAdminRole(role);
}

export function canAccessStockModules(role: UserRole | undefined): boolean {
  return isStockOperatorRole(role);
}

export function canAccessPurchaseModules(role: UserRole | undefined): boolean {
  return isPurchaseOperatorRole(role);
}

export function isPurchaseOnlyOperator(role: UserRole | undefined): boolean {
  return role === 'PURCHASE_OPERATOR';
}

export function getDefaultRouteForRole(role: UserRole | undefined): string {
  if (isPurchaseOnlyOperator(role)) {
    return '/compras/solicitacoes';
  }
  return '/';
}
