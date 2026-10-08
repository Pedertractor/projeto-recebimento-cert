import { Navigate } from 'react-router-dom';

import { useWebSession } from '@/hooks/auth/use-web-session';
import { getDefaultRouteForRole } from '@/lib/role-access';
import { HomePage } from '@/pages/home-page';

export function HomeRoute() {
  const { data: user } = useWebSession();
  const destination = getDefaultRouteForRole(user?.role);

  if (destination !== '/') {
    return <Navigate to={destination} replace />;
  }

  return <HomePage />;
}
