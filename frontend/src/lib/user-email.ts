import type { PublicUser } from '@/types/user';
import { isSuperAdminRole } from '@/lib/user-labels';

export function userNeedsEmail(user: PublicUser | undefined): boolean {
  if (!user || isSuperAdminRole(user.role)) {
    return false;
  }

  return !user.email?.trim();
}
