import { Loader2Icon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useWebSession } from '@/hooks/auth/use-web-session';
import { isSuperAdminRole } from '@/lib/user-labels';

function SuperAdminAccessGate({ children }: { children: ReactNode }) {
  const { data: user, isLoading, isError } = useWebSession();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !user || !isSuperAdminRole(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function RequireSuperAdmin() {
  return (
    <SuperAdminAccessGate>
      <Outlet />
    </SuperAdminAccessGate>
  );
}

export function SuperAdminRoute({ children }: { children: ReactNode }) {
  return <SuperAdminAccessGate>{children}</SuperAdminAccessGate>;
}

/** Aliases para compatibilidade */
export const RequireAdmin = RequireSuperAdmin;
export const AdminRoute = SuperAdminRoute;
