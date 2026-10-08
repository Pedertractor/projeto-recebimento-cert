import { Check, Hourglass, MailCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

import { SupplierLogo } from '@/components/suppliers/supplier-logo';
import { formatRequestDate } from '@/lib/certificate-request-labels';
import { cn } from '@/lib/utils';
import type { CertificateRequest } from '@/types/certificate-request';
import { formatCnpjInput } from '@/utils/cnpj';

type PurchaseRequestCardsProps = {
  requests: CertificateRequest[];
};

type CardTone = 'pending' | 'email' | 'done' | 'cancelled';

function cardTone(request: CertificateRequest): CardTone {
  if (request.status === 'AGUARDANDO_FORNECEDOR') {
    return 'email';
  }
  if (request.status === 'CONCLUIDA') {
    return 'done';
  }
  if (request.status === 'CANCELADA') {
    return 'cancelled';
  }
  return 'pending';
}

const tonePanelClass: Record<CardTone, string> = {
  pending: 'bg-amber-500 text-white',
  email: 'bg-sky-600 text-white',
  done: 'bg-brand text-brand-foreground',
  cancelled: 'bg-zinc-500 text-white',
};

const toneDetailClass: Record<CardTone, string> = {
  pending: 'text-amber-800 dark:text-amber-200',
  email: 'text-sky-700 dark:text-sky-300',
  done: 'text-foreground',
  cancelled: 'text-foreground',
};

export function PurchaseRequestStatusLegend() {
  return (
    <div className="flex w-full flex-wrap items-center justify-end gap-x-5 gap-y-2">
      <LegendTag swatchClassName="bg-amber-500" label="Pendente" />
      <LegendTag swatchClassName="bg-sky-600" label="E-mail enviado" />
      <LegendTag swatchClassName="bg-brand" label="Concluída" />
    </div>
  );
}

function LegendTag({
  label,
  swatchClassName,
}: {
  label: string;
  swatchClassName: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
      {label}
      <span
        className={cn(
          'size-4 shrink-0 rounded-sm border-2 border-foreground/40',
          swatchClassName,
        )}
        aria-hidden
      />
    </span>
  );
}

function InProgressHourglass({ className }: { className?: string }) {
  return (
    <motion.span
      className={cn('inline-flex shrink-0', className)}
      aria-label="Solicitação em andamento"
      animate={{ rotate: [0, 180, 180, 360, 360] }}
      transition={{
        duration: 3.2,
        times: [0, 0.22, 0.5, 0.72, 1],
        ease: ['easeInOut', 'linear', 'easeInOut', 'linear'],
        repeat: Infinity,
      }}
    >
      <Hourglass size={22} />
    </motion.span>
  );
}

function PurchaseRequestCard({ request }: { request: CertificateRequest }) {
  const tone = cardTone(request);
  const requesterName =
    request.createdByName?.trim() || 'Operador de estoque';

  return (
    <Link
      to={`/compras/solicitacoes/${request.id}`}
      className="flex h-full min-h-72 flex-col overflow-hidden rounded-2xl bg-background shadow-sm ring-1 ring-border/60 transition-transform hover:-translate-y-0.5"
    >
      <div
        className={cn(
          'flex min-h-0 flex-1 items-center gap-3 rounded-b-2xl px-3 py-3',
          tonePanelClass[tone],
        )}
      >
        <div className="size-11 shrink-0 overflow-hidden rounded-xl bg-background ring-1 ring-white/40">
          <SupplierLogo
            name={request.supplier.name}
            logoStoragePath={request.supplier.logoStoragePath}
          />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-wide text-white/75 uppercase">
            Empresa
          </p>
          <p className="truncate text-sm font-semibold leading-snug">
            {request.supplier.name}
          </p>
          <p className="truncate text-xs tabular-nums text-white/85">
            {formatCnpjInput(request.supplier.cnpj)}
          </p>
        </div>
      </div>

      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col justify-between gap-3 px-3 py-3',
          toneDetailClass[tone],
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wide uppercase opacity-70">
              Solicitante
            </p>
            <p className="truncate text-sm font-semibold">{requesterName}</p>
          </div>
          <CardStatusMark tone={tone} />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-wide uppercase opacity-70">
            Nota fiscal
          </p>
          <p className="truncate text-lg font-semibold tracking-tight">
            {request.invoiceNumber}
          </p>
          <p className="mt-1 truncate text-xs opacity-80">
            {formatRequestDate(request.invoiceDate)} ·{' '}
            {request.expectedCertificates} lote
            {request.expectedCertificates === 1 ? '' : 's'}
          </p>
        </div>
      </div>
    </Link>
  );
}

function CardStatusMark({ tone }: { tone: CardTone }) {
  if (tone === 'done') {
    return (
      <span
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
        aria-label="Concluída"
        title="Concluída"
      >
        <Check className="size-4" />
      </span>
    );
  }

  if (tone === 'email') {
    return (
      <span
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
        aria-label="E-mail enviado ao fornecedor"
        title="E-mail enviado"
      >
        <MailCheck className="size-4" />
      </span>
    );
  }

  if (tone === 'pending') {
    return <InProgressHourglass className="text-amber-600 dark:text-amber-300" />;
  }

  return null;
}

export function PurchaseRequestCards({ requests }: PurchaseRequestCardsProps) {
  if (requests.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhuma solicitação encontrada.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {requests.map((request) => (
        <PurchaseRequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}
