import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionIconProvider } from '@/components/motion-icon-provider';
import { DefaultRouteRedirect } from '@/components/auth/default-route-redirect';
import { HomeRoute } from '@/components/auth/home-route';
import { RequireSuperAdmin } from '@/components/auth/require-admin';
import { RequireAuth } from '@/components/auth/require-auth';
import { RequirePurchaseOperator } from '@/components/auth/require-purchase-operator';
import { RequireStockOperator } from '@/components/auth/require-stock-operator';
import { Toaster } from '@/components/ui/sonner';
import { AppShell } from '@/layouts/app-shell';
import { AdminThemeProvider } from '@/providers/admin-theme-provider';
import { LoginPage } from '@/pages/auth/login-page';
import { CertificateComparisonPage } from '@/pages/certificate-comparison-page';
import { DocQualidadePage } from '@/pages/doc-qualidade-page';
import { FornecedoresPage } from '@/pages/fornecedores-page';
import { MinhasSolicitacoesPage } from '@/pages/minhas-solicitacoes-page';
import { NotaFiscalDetailPage } from '@/pages/nota-fiscal-detail-page';
import { NotasFiscaisPage } from '@/pages/notas-fiscais-page';
import { SolicitacaoComprasDetailPage } from '@/pages/solicitacao-compras-detail-page';
import { SolicitacaoEstoqueDetailPage } from '@/pages/solicitacao-estoque-detail-page';
import { SolicitacoesComprasPage } from '@/pages/solicitacoes-compras-page';
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
                <Route path="/" element={<HomeRoute />} />
                <Route element={<RequireStockOperator />}>
                  <Route path="/doc-qualidade" element={<DocQualidadePage />} />
                  <Route
                    path="/cadastrar-nf"
                    element={<SolicitarCertificadoPage />}
                  />
                  <Route
                    path="/solicitar-certificado"
                    element={<Navigate to="/cadastrar-nf" replace />}
                  />
                  <Route
                    path="/minhas-solicitacoes"
                    element={<MinhasSolicitacoesPage />}
                  />
                  <Route
                    path="/minhas-solicitacoes/:id"
                    element={<SolicitacaoEstoqueDetailPage />}
                  />
                  <Route
                    path="/notas-fiscais"
                    element={<NotasFiscaisPage />}
                  />
                  <Route
                    path="/notas-fiscais/:id"
                    element={<NotaFiscalDetailPage />}
                  />
                  <Route
                    path="/notas-fiscais/:id/comparacao/:attachmentId"
                    element={<CertificateComparisonPage />}
                  />
                  <Route path="/fornecedores" element={<FornecedoresPage />} />
                </Route>
                <Route element={<RequirePurchaseOperator />}>
                  <Route
                    path="/compras/solicitacoes"
                    element={<SolicitacoesComprasPage />}
                  />
                  <Route
                    path="/compras/solicitacoes/:id"
                    element={<SolicitacaoComprasDetailPage />}
                  />
                </Route>
                <Route element={<RequireSuperAdmin />}>
                  <Route path="/usuarios" element={<UsuariosPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<DefaultRouteRedirect />} />
          </Routes>
          <Toaster />
        </MotionIconProvider>
      </AdminThemeProvider>
    </BrowserRouter>
  );
}
