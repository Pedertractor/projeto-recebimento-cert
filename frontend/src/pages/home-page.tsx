import { useQuery } from '@tanstack/react-query';

import { HomeActionTile } from '@/components/home/home-action-tile';
import { HomeHeroCard } from '@/components/home/home-hero-card';
import { CreateSupplierDialog } from '@/components/suppliers/create-supplier-dialog';
import { useWebSession } from '@/hooks/auth/use-web-session';
import {
  canAccessPurchaseModules,
  canAccessStockModules,
} from '@/lib/role-access';
import {
  certificateRequestsListQueryKey,
  listCertificateRequests,
  listPurchaseCertificateRequests,
  purchaseCertificateRequestsListQueryKey,
} from '@/services/certificate-requests/certificate-request.service';
import type { CertificateRequest } from '@/types/certificate-request';

function countByStatus(
  requests: CertificateRequest[] | undefined,
  status: CertificateRequest['status'],
): number {
  return requests?.filter((request) => request.status === status).length ?? 0;
}

function countSupplierEmails(
  requests: CertificateRequest[] | undefined,
): number {
  return (
    requests?.filter((request) => request.supplierContactAt != null).length ?? 0
  );
}

function HomeStatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-h-28 flex-col justify-between rounded-2xl px-4 py-4 text-brand-foreground shadow-sm sm:min-h-32 sm:px-5">
      <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {value}
      </p>
      <p className="text-sm text-brand-foreground/80">{label}</p>
    </div>
  );
}

export function HomePage() {
  const { data: user } = useWebSession();
  const canUseStockModules = canAccessStockModules(user?.role);
  const canUsePurchaseModules = canAccessPurchaseModules(user?.role);

  const stockRequestsQuery = useQuery({
    queryKey: certificateRequestsListQueryKey,
    queryFn: listCertificateRequests,
    enabled: canUseStockModules,
  });

  const purchaseRequestsQuery = useQuery({
    queryKey: purchaseCertificateRequestsListQueryKey,
    queryFn: listPurchaseCertificateRequests,
    enabled: canUsePurchaseModules && !canUseStockModules,
  });

  const requests = canUseStockModules
    ? stockRequestsQuery.data
    : purchaseRequestsQuery.data;

  const awaitingPurchaseCount = countByStatus(requests, 'AGUARDANDO_COMPRAS');
  const supplierEmailCount = countSupplierEmails(requests);
  const completedCount = countByStatus(requests, 'CONCLUIDA');
  const openRequestsCount =
    requests?.filter(
      (request) =>
        request.status !== 'CONCLUIDA' && request.status !== 'CANCELADA',
    ).length ?? 0;

  if (!canUseStockModules && !canUsePurchaseModules) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 py-4">
        <div className="rounded-2xl border bg-card px-6 py-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            Use o menu lateral para navegar pelas funcionalidades disponíveis
            para o seu perfil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 py-2 lg:grid-cols-3 lg:items-start">
      <div className="flex flex-col gap-5 lg:col-span-2">
        <HomeHeroCard
          title={
            canUseStockModules
              ? 'NF chegou sem certificado?'
              : 'Solicitações de certificado'
          }
          description={
            canUseStockModules
              ? 'Abra uma solicitação para o compras pedir os documentos ao fornecedor.'
              : 'Anexe o PDF com a NF e os certificados para concluir cada pedido.'
          }
          actionLabel={
            canUseStockModules ? 'Solicitar certificado' : 'Abrir solicitações'
          }
          actionTo={
            canUseStockModules
              ? '/solicitar-certificado'
              : '/compras/solicitacoes'
          }
        />

        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <HomeStatCard
            value={awaitingPurchaseCount}
            label="Solicitações ao compras"
          />
          <HomeStatCard
            value={supplierEmailCount}
            label="Envios de e-mail aos fornecedores"
          />
          <HomeStatCard value={completedCount} label="Concluídas" />
        </div>
      </div>

      <aside className="flex flex-col gap-3 lg:col-span-1">
        {canUseStockModules ? (
          <>
            <HomeActionTile
              title="Minhas solicitações"
              description="Acompanhe o que ainda está em andamento"
              to="/minhas-solicitacoes"
              badge={openRequestsCount}
            />
            <HomeActionTile
              title="NF's de materiais"
              description="Conferir certificados por lote"
              to="/notas-fiscais"
            />
            <HomeActionTile
              title="Doc qualidade"
              description="Padrões usados na conferência"
              to="/doc-qualidade"
            />
            <CreateSupplierDialog
              trigger={
                <HomeActionTile
                  title="Novo fornecedor"
                  description="Cadastro para usar nas solicitações"
                />
              }
            />
          </>
        ) : (
          <HomeActionTile
            title="Solicitações de certificado"
            description="Responder pedidos do estoque"
            to="/compras/solicitacoes"
            badge={openRequestsCount}
          />
        )}
      </aside>
    </div>
  );
}
