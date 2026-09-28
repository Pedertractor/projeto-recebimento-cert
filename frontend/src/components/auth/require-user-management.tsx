import { Loader2Icon } from 'lucide-react';
import { Navigate, Outlet } from 'react-router-dom';

import { useWebSession } from '@/hooks/auth/use-web-session';
import { canAccessUserManagement } from '@/lib/role-access';

export function RequireUserManagement() {
  const { data: user, isLoading, isError } = useWebSession();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !user || !canAccessUserManagement(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
