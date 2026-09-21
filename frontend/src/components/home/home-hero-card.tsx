import { useId, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { APP_LOGO_SRC, BrandMark } from '@/components/brand-mark';
import { useWebSession } from '@/hooks/auth/use-web-session';

function firstName(fullName: string | null | undefined): string {
  const part = fullName?.trim().split(/\s+/)[0];
  return part ?? '';
}

function greetingPhrase(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

const CARD_RADIUS = 24;
const BUTTON_RADIUS = 18;
const NOTCH_GAP = 12;
const NOTCH_INNER_RADIUS = BUTTON_RADIUS + NOTCH_GAP;
const NOTCH_OUTER_RADIUS = BUTTON_RADIUS;

function buildNotchPath(
  width: number,
  height: number,
  notchWidth: number,
  notchHeight: number,
): string {
  const r = Math.min(CARD_RADIUS, width / 4, height / 4);
  const nr = Math.min(NOTCH_OUTER_RADIUS, notchWidth / 2, notchHeight / 2);
  const ir = Math.min(
    NOTCH_INNER_RADIUS,
    Math.max(8, notchWidth - nr - 12),
    Math.max(8, notchHeight - nr - 12),
  );
  const notchLeft = width - notchWidth;
  const notchTop = height - notchHeight;

  return [
    `M ${r} 0`,
    `H ${width - r}`,
    `A ${r} ${r} 0 0 1 ${width} ${r}`,
    `V ${notchTop - nr}`,
    `A ${nr} ${nr} 0 0 1 ${width - nr} ${notchTop}`,
    `H ${notchLeft + ir}`,
    `A ${ir} ${ir} 0 0 0 ${notchLeft} ${notchTop + ir}`,
    `V ${height - nr}`,
    `A ${nr} ${nr} 0 0 1 ${notchLeft - nr} ${height}`,
    `H ${r}`,
    `A ${r} ${r} 0 0 1 0 ${height - r}`,
    `V ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    'Z',
  ].join(' ');
}

type HomeHeroCardProps = {
  title: string;
  description: string;
  actionLabel: string;
  actionTo: string;
  fill?: boolean;
};

export function HomeHeroCard({
  title,
  description,
  actionLabel,
  actionTo,
  fill = false,
}: HomeHeroCardProps) {
  const { data: user } = useWebSession();
  const displayName = firstName(user?.name);
  const clipId = useId().replace(/:/g, '');
  const wrapRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const buttonWrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [logoSize, setLogoSize] = useState({ width: 0, height: 0 });
  const [buttonSize, setButtonSize] = useState({ width: 196, height: 48 });

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const logo = logoRef.current;
    const buttonWrap = buttonWrapRef.current;
    if (!wrap) {
      return;
    }

    const update = () => {
      const wrapRect = wrap.getBoundingClientRect();
      setSize({ width: wrapRect.width, height: wrapRect.height });
      if (logo) {
        const logoRect = logo.getBoundingClientRect();
        setLogoSize({
          width: logoRect.width,
          height: logoRect.height,
        });
      }
      if (buttonWrap) {
        const buttonRect = buttonWrap.getBoundingClientRect();
        setButtonSize({
          width: buttonRect.width,
          height: buttonRect.height,
        });
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(wrap);
    if (logo) {
      observer.observe(logo);
    }
    if (buttonWrap) {
      observer.observe(buttonWrap);
    }

    return () => observer.disconnect();
  }, []);

  const notchWidth = buttonSize.width + NOTCH_GAP;
  const notchHeight = buttonSize.height + NOTCH_GAP;
  const path =
    size.width > 0 && size.height > 0
      ? buildNotchPath(size.width, size.height, notchWidth, notchHeight)
      : '';
  const isStacked = logoSize.width >= size.width - 2;
  const greenWidth = isStacked ? size.width : logoSize.width || size.width / 2;
  const greenHeight = isStacked ? logoSize.height || size.height : size.height;

  return (
    <section
      ref={wrapRef}
      className={
        fill
          ? 'relative flex h-full min-h-0 w-full flex-1 flex-col'
          : 'relative flex min-h-56 flex-col sm:min-h-72 lg:min-h-80'
      }
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full drop-shadow-sm"
        viewBox={size.width ? `0 0 ${size.width} ${size.height}` : undefined}
        preserveAspectRatio="none"
      >
        {path ? (
          <>
            <defs>
              <clipPath id={clipId}>
                <path d={path} />
              </clipPath>
            </defs>
            <path
              d={path}
              className="fill-card stroke-border"
              strokeWidth="1"
            />
            <rect
              x="0"
              y="0"
              width={greenWidth}
              height={greenHeight}
              className="fill-brand"
              clipPath={`url(#${clipId})`}
            />
          </>
        ) : null}
      </svg>

      <div className="relative grid min-h-0 flex-1 lg:grid-cols-2 lg:items-stretch">
        <div
          ref={logoRef}
          className="flex h-full min-h-full flex-col items-center justify-center gap-4 px-6 py-8"
          >
         
          <BrandMark
            logoSrc={APP_LOGO_SRC}
            alt="Certificado de Qualidade"
            className={
              fill
                ? 'h-[clamp(7rem,22vmin,16rem)] w-[clamp(7rem,22vmin,16rem)] object-contain'
                : 'h-28 w-28 object-contain sm:h-36 sm:w-36 lg:h-40 lg:w-40'
            }
          />
          <p className="text-center text-xs tracking-wide text-brand-foreground/75">
            Pedertractor &amp; TractorComponents
          </p>
        </div>

        <div
          className="flex h-full items-center border-t border-border/70 px-6 py-8 lg:border-t-0 lg:border-l"
          style={{ paddingBottom: notchHeight + 16 }}
        >
          <div
            className={
              fill
                ? 'flex max-w-lg flex-col gap-3'
                : 'flex max-w-sm flex-col gap-3'
            }
          >
            <h2
              className={
                fill
                  ? 'text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl'
                  : 'text-xl font-semibold tracking-tight text-foreground sm:text-2xl'
              }
            >
              {title}
            </h2>
            <p
              className={
                fill
                  ? 'text-sm text-muted-foreground sm:text-base lg:text-lg'
                  : 'text-sm text-muted-foreground sm:text-base'
              }
            >
              {description}
            </p>
          </div>
        </div>
      </div>

      

      <div ref={buttonWrapRef} className="absolute right-0 bottom-0 z-10">
        <Link
          to={actionTo}
          className="group inline-flex items-center gap-2 bg-brand px-5 py-3 text-sm font-medium text-brand-foreground shadow-sm transition-colors hover:bg-brand/90"
          style={{ borderRadius: BUTTON_RADIUS }}
        >
          {actionLabel}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </div>
    </section>
  );
}
