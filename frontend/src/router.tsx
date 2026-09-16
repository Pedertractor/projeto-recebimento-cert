import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionIconProvider } from '@/components/motion-icon-provider';
import { RequireSuperAdmin } from '@/components/auth/require-admin';
import { RequireAuth } from '@/components/auth/require-auth';
import { RequireStockOperator } from '@/components/auth/require-stock-operator';
import { Toaster } from '@/components/ui/sonner';
import { AppShell } from '@/layouts/app-shell';
import { AdminThemeProvider } from '@/providers/admin-theme-provider';
import { LoginPage } from '@/pages/auth/login-page';
import { HomePage } from '@/pages/home-page';
import { MinhasSolicitacoesPage } from '@/pages/minhas-solicitacoes-page';
import { SolicitarCertificadoPage } from '@/pages/solicitar-certificado-page';
import { UsuariosPage } from '@/pages/usuarios-page';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AdminThemeProvider>
        <MotionIconProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<HomePage />} />
                <Route element={<RequireStockOperator />}>
                  <Route
                    path="/solicitar-certificado"
                    element={<SolicitarCertificadoPage />}
                  />
                  <Route
                    path="/minhas-solicitacoes"
                    element={<MinhasSolicitacoesPage />}
                  />
                </Route>
                <Route element={<RequireSuperAdmin />}>
                  <Route path="/usuarios" element={<UsuariosPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </MotionIconProvider>
      </AdminThemeProvider>
    </BrowserRouter>
  );
}
