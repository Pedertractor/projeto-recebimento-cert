import { useRef, useState, type UIEvent } from 'react';
import { ArrowUp } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { AppSidebar } from '@/components/app-sidebar';
import { AdminThemeToggle } from '@/components/admin-theme-toggle';
import { UserEmailRequiredNotifier } from '@/components/auth/user-email-required-notifier';
import { PurchasePendingRequestNotifier } from '@/components/requests/purchase-pending-request-notifier';
import { Button } from '@/components/ui/button';
import { AppChromeProvider, useAppChrome } from '@/contexts/app-chrome-context';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function AppShell() {
  return (
    <AppChromeProvider>
      <AppShellContent />
    </AppChromeProvider>
  );
}

function AppShellContent() {
  const { hideHeader } = useAppChrome();
  const pageScrollRef = useRef<HTMLDivElement>(null);
  const [showMobileScrollTop, setShowMobileScrollTop] = useState(false);

  function handlePageScroll(event: UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    const scrollableDistance = element.scrollHeight - element.clientHeight;
    const scrollProgress =
      scrollableDistance > 0 ? element.scrollTop / scrollableDistance : 0;

    setShowMobileScrollTop(scrollProgress >= 0.25);
  }

  function scrollPageToTop() {
    pageScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <SidebarProvider>
      <UserEmailRequiredNotifier />
      <PurchasePendingRequestNotifier />
      <AppSidebar />
      <SidebarInset className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {hideHeader ? null : (
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 max-md:px-3 md:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <SidebarTrigger className="-ml-1 size-9 max-md:size-10" />
            </div>
            <div className="flex shrink-0 items-center gap-2 md:gap-3">
              <div className="max-w-[7.5rem] min-w-0 leading-tight sm:hidden">
                <p className="truncate text-xs font-medium text-brand">
                  Pedertractor
                </p>
                <p className="truncate text-[10px] text-foreground/70">
                  &amp; TractorComponents
                </p>
              </div>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm text-brand">Pedertractor</p>
                <p className="text-xs text-foreground/70">
                  &amp; TractorComponents
                </p>
              </div>
              <AdminThemeToggle />
            </div>
          </header>
        )}
        <div
          ref={pageScrollRef}
          data-app-page-scroll
          className={cn(
            'app-scrollbar flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]',
            hideHeader
              ? 'overflow-hidden p-0'
              : 'px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-4 md:p-6 md:pt-6 md:pb-6',
          )}
          onScroll={handlePageScroll}
        >
          <Outlet />
        </div>
        {showMobileScrollTop ? (
          <Button
            type="button"
            size="icon"
            className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 rounded-full shadow-lg md:hidden"
            aria-label="Voltar ao início da página"
            title="Voltar ao início"
            onClick={scrollPageToTop}
          >
            <ArrowUp className="size-5" aria-hidden />
          </Button>
        ) : null}
      </SidebarInset>
    </SidebarProvider>
  );
}
