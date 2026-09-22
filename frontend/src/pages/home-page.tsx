import { useQuery } from '@tanstack/react-query';

import { HomeActionTile } from '@/components/home/home-action-tile';
import { HomeHeroCard } from '@/components/home/home-hero-card';
import { useWebSession } from '@/hooks/auth/use-web-session';
import { canAccessStockModules } from '@/lib/role-access';
import {
  isNfConferenceComplete,
  isNfMissingLotComparisons,
} from '@/lib/certificate-request-labels';
import {
  certificateRequestsListQueryKey,
  completedCertificateRequestsQueryKey,
  listCertificateRequests,
  listCompletedCertificateRequests,
} from '@/services/certificate-requests/certificate-request.service';

function HomeStatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-h-[5.5rem] flex-col justify-between px-4 py-4 max-md:gap-2 md:min-h-[clamp(6.5rem,14vh,10rem)] sm:px-6 sm:py-5">
      <p className="text-3xl font-semibold leading-none tracking-tight text-brand md:text-[clamp(1.875rem,3.5vw,3.25rem)]">
        {value}
      </p>
      <p className="text-sm text-muted-foreground sm:text-base">{label}</p>
    </div>
  );
}

const homeActionTileClassName =
  'min-h-[4.75rem] flex-1 py-4 md:min-h-[clamp(5.5rem,11vh,9rem)] md:py-5 sm:px-5 sm:py-6';

export function HomePage() {
  const { data: user } = useWebSession();
  const canUseStockModules = canAccessStockModules(user?.role);

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

  if (!canUseStockModules) {
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
    <div className="mx-auto grid w-full min-w-0 max-w-[100rem] flex-1 gap-4 py-1 md:min-h-[calc(100dvh-7.5rem)] md:gap-5 md:py-2 lg:grid-cols-3 lg:items-stretch">
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
