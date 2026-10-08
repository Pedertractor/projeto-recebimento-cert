import { Loader2Icon } from 'lucide-react';
import { Navigate, Outlet } from 'react-router-dom';

import { useWebSession } from '@/hooks/auth/use-web-session';
import { canAccessPurchaseModules } from '@/lib/role-access';

export function RequirePurchaseOperator() {
  const { data: user, isLoading, isError } = useWebSession();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !user || !canAccessPurchaseModules(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
