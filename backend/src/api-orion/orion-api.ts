import { env } from '../config/env.js';

const TZ = 'America/Sao_Paulo';

type OrionEventBody = {
  userId: string;
  userName?: string;
  cardNumberUser?: string;
  metadata?: Record<string, unknown>;
};

let currentDateKey = '';
const sentToday = new Set<string>();

function getSaoPauloDateKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

function ensureTodayBucket() {
  const today = getSaoPauloDateKey();
  if (today !== currentDateKey) {
    sentToday.clear();
    currentDateKey = today;
  }
}

/** Uma notificação por usuário por dia (fuso SP), independente da ação/módulo. */
function buildDailyDedupeKey(userId: string) {
  ensureTodayBucket();
  return `${currentDateKey}:${userId}`;
}

export async function notifyOrion(
  body: OrionEventBody,
): Promise<{ ok: true; data: unknown } | { ok: false; error: unknown }> {
  const orionUrl = env.ORION_URL;
  const orionToken = env.ORION_APP_TOKEN;

  if (!orionUrl || !orionToken) {
    return { ok: false, error: 'Orion não configurado' };
  }

  try {
    const res = await fetch(orionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orionToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[orion]', res.status, err);
      return { ok: false, error: err };
    }

    const data = await res.json().catch(() => null);
    return { ok: true, data };
  } catch (error) {
    console.error('[orion] request failed', error);
    return { ok: false, error };
  }
}

/** Envia ao Orion no máximo 1 vez por usuário por dia (fuso SP). */
export async function notifyOrionOncePerDay(
  body: OrionEventBody,
): Promise<
  | { ok: true; data: unknown; skipped?: false }
  | { ok: true; skipped: true }
  | { ok: false; error: unknown }
> {
  const dedupeKey = buildDailyDedupeKey(body.userId);

  if (sentToday.has(dedupeKey)) {
    return { ok: true, skipped: true };
  }

  sentToday.add(dedupeKey);

  const result = await notifyOrion(body);

  if (!result.ok) {
    sentToday.delete(dedupeKey);
  }

  return result;
}
