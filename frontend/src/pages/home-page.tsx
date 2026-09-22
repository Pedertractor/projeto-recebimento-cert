import { useQuery } from '@tanstack/react-query';

import { HomeActionTile } from '@/components/home/home-action-tile';
import { HomeHeroCard } from '@/components/home/home-hero-card';
import { PurchaseHomePanel } from '@/components/home/purchase-home-panel';
import { useWebSession } from '@/hooks/auth/use-web-session';
import {
  canAccessPurchaseModules,
  canAccessStockModules,
} from '@/lib/role-access';
import {
  isNfConferenceComplete,
  isNfMissingLotComparisons,
} from '@/lib/certificate-request-labels';
import {
  certificateRequestsListQueryKey,
  completedCertificateRequestsQueryKey,
  listCertificateRequests,
  listCompletedCertificateRequests,
  listPurchaseCertificateRequests,
  purchaseCertificateRequestsListQueryKey,
} from '@/services/certificate-requests/certificate-request.service';

function HomeStatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-h-[clamp(6.5rem,14vh,10rem)] flex-col justify-between px-4 py-4 sm:px-6 sm:py-5">
      <p className="text-[clamp(1.875rem,3.5vw,3.25rem)] font-semibold leading-none tracking-tight text-brand">
        {value}
      </p>
      <p className="text-sm text-muted-foreground sm:text-base">{label}</p>
    </div>
  );
}

const homeActionTileClassName =
  'min-h-[clamp(5.5rem,11vh,9rem)] flex-1 py-5 sm:px-5 sm:py-6';

export function HomePage() {
  const { data: user } = useWebSession();
  const canUseStockModules = canAccessStockModules(user?.role);
  const canUsePurchaseModules = canAccessPurchaseModules(user?.role);
  const isPurchaseHome = canUsePurchaseModules && !canUseStockModules;

  const stockRequestsQuery = useQuery({
    queryKey: certificateRequestsListQueryKey,
    queryFn: listCertificateRequests,
    enabled: canUseStockModules,
  });

  const conferenceRequestsQuery = useQuery({
    queryKey: completedCertificateRequestsQueryKey,
    queryFn: listCompletedCertificateRequests,
    enabled: canUseStockModules,
  });

  const purchaseRequestsQuery = useQuery({
    queryKey: purchaseCertificateRequestsListQueryKey,
    queryFn: listPurchaseCertificateRequests,
    enabled: isPurchaseHome,
  });

  const requests = stockRequestsQuery.data;
  const conferenceRequests = conferenceRequestsQuery.data;

  const openRequestsCount =
    requests?.filter(
      (request) =>
        request.status !== 'CONCLUIDA' && request.status !== 'CANCELADA',
    ).length ?? 0;

  const nfsMissingComparisonsCount =
    conferenceRequests?.filter(isNfMissingLotComparisons).length ?? 0;

  const completedNfsCount =
    conferenceRequests?.filter(isNfConferenceComplete).length ?? 0;

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

  if (isPurchaseHome) {
    const purchaseRequests = purchaseRequestsQuery.data ?? [];
    const openPurchaseRequests = purchaseRequests.filter(
      (request) =>
        request.status !== 'CONCLUIDA' && request.status !== 'CANCELADA',
    );
    const withoutEmailCount = openPurchaseRequests.filter(
      (request) => request.status === 'AGUARDANDO_COMPRAS',
    ).length;
    const awaitingReplyCount = openPurchaseRequests.filter(
      (request) => request.status === 'AGUARDANDO_FORNECEDOR',
    ).length;

    return (
      <div className="mx-auto grid min-h-[calc(100dvh-7.5rem)] w-full max-w-[100rem] flex-1 gap-5 py-2 lg:grid-cols-3 lg:items-stretch">
        <div className="flex min-h-0 flex-col gap-5 lg:col-span-2">
          <div className="flex min-h-0 flex-1 flex-col">
            <HomeHeroCard
              fill
              title="Solicitações de certificado"
              description="Anexe o PDF com a NF e os certificados para concluir cada pedido."
              actionLabel="Abrir solicitações"
              actionTo="/compras/solicitacoes"
            />
          </div>

          <div className="grid shrink-0 grid-cols-1 divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <HomeStatCard
              value={withoutEmailCount}
              label="Solicitações sem envio de e-mail"
            />
            <HomeStatCard
              value={awaitingReplyCount}
              label="Aguardando retorno de e-mail"
            />
          </div>
        </div>
        <PurchaseHomePanel
          requests={purchaseRequestsQuery.data}
          isLoading={purchaseRequestsQuery.isLoading}
          isError={purchaseRequestsQuery.isError}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-7.5rem)] w-full max-w-[100rem] flex-1 gap-5 py-2 lg:grid-cols-3 lg:items-stretch">
      <div className="flex min-h-0 flex-col gap-5 lg:col-span-2">
        <div className="flex min-h-0 flex-1 flex-col">
          <HomeHeroCard
            fill
            title="Cadastrar NF de materiais"
            description="Registre a nota fiscal recebida. O documento da NF é opcional e os certificados podem ser vinculados depois."
            actionLabel="Cadastrar NF"
            actionTo="/cadastrar-nf"
          />
        </div>

        <div className="grid shrink-0 grid-cols-1 divide-y divide-border overflow-hidden rounded-2xl  shadow-sm ring-1 ring-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <HomeStatCard
            value={openRequestsCount}
            label="Solicitações em aberto"
          />
          <HomeStatCard
            value={nfsMissingComparisonsCount}
            label="NFs sem comparativo em todos os lotes"
          />
          <HomeStatCard value={completedNfsCount} label="NFs concluídas" />
        </div>
      </div>

      <aside className="flex min-h-0 flex-col gap-3 lg:col-span-1">
        <HomeActionTile
          className={homeActionTileClassName}
          title="NF's de materiais"
          description="Conferir certificados por lote"
          to="/notas-fiscais"
        />
        <HomeActionTile
          className={homeActionTileClassName}
          title="Minhas solicitações"
          description="Acompanhe o que ainda está em andamento"
          to="/minhas-solicitacoes"
          badge={openRequestsCount}
        />
        <HomeActionTile
          className={homeActionTileClassName}
          title="Doc qualidade"
          description="Padrões usados na conferência"
          to="/doc-qualidade"
        />
        <HomeActionTile
          className={homeActionTileClassName}
          title="Fornecedores"
          description="Listar e editar cadastros"
          to="/fornecedores"
        />
      </aside>
    </div>
  );
}
