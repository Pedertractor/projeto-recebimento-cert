import { Navigate } from 'react-router-dom';

import { useWebSession } from '@/hooks/auth/use-web-session';
import { isPurchaseOnlyOperator } from '@/lib/role-access';
import { HomePage } from '@/pages/home-page';

export function HomeRoute() {
  const { data: user } = useWebSession();

  if (isPurchaseOnlyOperator(user?.role)) {
    return <Navigate to="/compras/solicitacoes" replace />;
  }

  return <HomePage />;
}
