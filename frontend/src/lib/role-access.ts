import {
  isQualityViewerRole,
  isStockLeaderRole,
  isSuperAdminRole,
} from '@/lib/user-labels';
import type { UserRole } from '@/types/user';

export function isStockOperatorRole(role: UserRole | undefined): boolean {
  return (
    role === 'STOCK_OPERATOR' ||
    isStockLeaderRole(role) ||
    isSuperAdminRole(role)
  );
}

export function isPurchaseOperatorRole(role: UserRole | undefined): boolean {
  return (
    role === 'PURCHASE_OPERATOR' ||
    isStockLeaderRole(role) ||
    isSuperAdminRole(role)
  );
}

export function canAccessUserManagement(role: UserRole | undefined): boolean {
  return isSuperAdminRole(role) || isStockLeaderRole(role);
}

export function canAdministerUsers(role: UserRole | undefined): boolean {
  return isSuperAdminRole(role);
}

export function canManageQualityDocuments(role: UserRole | undefined): boolean {
  return isSuperAdminRole(role) || isStockLeaderRole(role);
}

export function canViewQualityDocuments(role: UserRole | undefined): boolean {
  return canManageQualityDocuments(role) || isQualityViewerRole(role);
}

/** Busca por espessura/largura/comprimento (NF e recebimento). */
export function canAccessQualityDimensionalSearch(
  role: UserRole | undefined,
): boolean {
  return (
    isSuperAdminRole(role) ||
    isQualityViewerRole(role) ||
    isStockLeaderRole(role)
  );
}

export function canDeleteInvoice(role: UserRole | undefined): boolean {
  return isSuperAdminRole(role) || isStockLeaderRole(role);
}

export function canExportNfConferenceExcel(
  role: UserRole | undefined,
): boolean {
  return isSuperAdminRole(role) || isStockLeaderRole(role);
}

export function canAccessStockModules(role: UserRole | undefined): boolean {
  return isStockOperatorRole(role);
}

/** Indicador de certificado novo do compras (líder acompanha; operador não vê). */
export function canViewUnseenPurchaseCertificateIndicators(
  role: UserRole | undefined,
): boolean {
  return isSuperAdminRole(role) || isStockLeaderRole(role);
}

export function canViewNfMaterials(role: UserRole | undefined): boolean {
  return (
    canAccessStockModules(role) ||
    role === 'PURCHASE_OPERATOR' ||
    isQualityViewerRole(role)
  );
}

export function canEditNfMaterials(role: UserRole | undefined): boolean {
  return canAccessStockModules(role);
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
  if (isQualityViewerRole(role)) {
    return '/doc-qualidade';
  }
  return '/';
}
