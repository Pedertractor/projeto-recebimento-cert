import { UserRole } from '../generated/prisma/enums.js';

export function isSuperAdminRole(role: UserRole): boolean {
  return role === UserRole.SUPERADMIN;
}

export function isStockLeaderRole(role: UserRole): boolean {
  return role === UserRole.STOCK_LEADER;
}

export function canManageAllStockCertificateRequests(role: UserRole): boolean {
  return isSuperAdminRole(role) || isStockLeaderRole(role);
}

export function canManageQualityDocuments(role: UserRole): boolean {
  return isSuperAdminRole(role) || isStockLeaderRole(role);
}

export function isAuthorizeRoleAllowed(
  userRole: UserRole,
  allowedRoles: UserRole[],
): boolean {
  if (isSuperAdminRole(userRole)) {
    return true;
  }

  if (allowedRoles.includes(userRole)) {
    return true;
  }

  if (
    isStockLeaderRole(userRole) &&
    (allowedRoles.includes(UserRole.STOCK_OPERATOR) ||
      allowedRoles.includes(UserRole.PURCHASE_OPERATOR))
  ) {
    return true;
  }

  return false;
}
