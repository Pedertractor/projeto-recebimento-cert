import { toast } from 'sonner';

import { APP_LOGO_SRC, BrandMark } from '@/components/brand-mark';
import { HomeActionTile } from '@/components/home/home-action-tile';
import { CreateSupplierDialog } from '@/components/suppliers/create-supplier-dialog';
import { useWebSession } from '@/hooks/auth/use-web-session';
import { canAccessStockModules } from '@/lib/role-access';

export function HomePage() {
  const { data: user } = useWebSession();
  const canUseStockModules = canAccessStockModules(user?.role);

  function showComingSoon(label: string): void {
    toast.message(`${label} será implementado em breve.`);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 py-4 sm:py-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <BrandMark
          logoSrc={APP_LOGO_SRC}
          alt="Certificado de Qualidade"
          className="h-36 w-56 sm:h-44 sm:w-72"
        />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Certificado de Qualidade
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Solicitação de certificados para chapas recebidas via nota fiscal.
          </p>
        </div>
      </div>

      {canUseStockModules ? (
        <div className="relative w-full max-w-4xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 -inset-y-6 rounded-4xl bg-linear-to-b from-brand-muted/50 via-transparent to-brand-muted/30 blur-2xl"
          />
          <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <HomeActionTile
              title="Doc qualidade - V2026"
              hoverDirection="left"
              disabled
              onClick={() => showComingSoon('Doc qualidade')}
            />
            <HomeActionTile
              title="Indicar NF de material"
              hoverDirection="right"
              disabled
              onClick={() => showComingSoon('Indicar NF de material')}
            />
            <HomeActionTile
              title="Solicitar certificado"
              hoverDirection="left"
              to="/solicitar-certificado"
            />
            <HomeActionTile
              title="Ver NF's de materiais"
              hoverDirection="right"
              disabled
              onClick={() => showComingSoon('Ver NF\'s de materiais')}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card px-6 py-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            Use o menu lateral para navegar pelas funcionalidades disponíveis
            para o seu perfil.
          </p>
        </div>
      )}

      {canUseStockModules ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <CreateSupplierDialog />
        </div>
      ) : null}
    </div>
  );
}
