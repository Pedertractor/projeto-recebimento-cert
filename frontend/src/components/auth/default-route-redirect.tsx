import { Loader2Icon } from 'lucide-react';
import { Navigate } from 'react-router-dom';

import { useWebSession } from '@/hooks/auth/use-web-session';
import { getDefaultRouteForRole } from '@/lib/role-access';

export function DefaultRouteRedirect() {
  const { data: user, isLoading, isError } = useWebSession();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
}
