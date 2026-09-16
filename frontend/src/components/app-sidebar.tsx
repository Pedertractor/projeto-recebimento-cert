import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { House, Users } from 'lucide-react-motion';

import { APP_LOGO_SRC, BrandMark } from '@/components/brand-mark';
import { motionIconGroupProps } from '@/components/motion-icon-provider';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useWebSession } from '@/hooks/auth/use-web-session';
import { isSuperAdminRole } from '@/lib/user-labels';

type SidebarNavItem = {
  label: string;
  href: string;
  tooltip: string;
  icon: React.ComponentType<{ size?: number }>;
  isActive: (pathname: string) => boolean;
};

function SidebarNavGroup({
  label,
  pathname,
  items,
}: {
  label: string;
  pathname: string;
  items: SidebarNavItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <SidebarGroup className="gap-0 p-1">
      <SidebarGroupLabel className="mb-0 h-5 px-2 py-0 text-[11px] leading-none">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  size="sm"
                  tooltip={item.tooltip}
                  isActive={item.isActive(pathname)}
                  className="py-1"
                >
                  <Link to={item.href} {...motionIconGroupProps}>
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation();
  const { data: user } = useWebSession();
  const isSuperAdmin = isSuperAdminRole(user?.role);

  const homeItems: SidebarNavItem[] = [
    {
      label: 'Início',
      href: '/',
      tooltip: 'Início',
      icon: House,
      isActive: (path) => path === '/',
    },
  ];

  const adminItems: SidebarNavItem[] = isSuperAdmin
    ? [
        {
          label: 'Usuários',
          href: '/usuarios',
          tooltip: 'Usuários',
          icon: Users,
          isActive: (path) => path.startsWith('/usuarios'),
        },
      ]
    : [];

  const navGroups = [
    { label: 'Início', items: homeItems },
    { label: 'Administração', items: adminItems },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex h-14 shrink-0 flex-row items-center gap-0 border-b border-sidebar-border px-2 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="Certificado de Qualidade"
              className="hover:bg-transparent group-data-[collapsible=icon]:justify-center"
            >
              <Link to="/">
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
                  <BrandMark
                    logoSrc={APP_LOGO_SRC}
                    className="size-full object-contain"
                  />
                </div>
                <span className="truncate font-semibold group-data-[collapsible=icon]:hidden">
                  Certificado de Qualidade
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-2.5 py-2">
        {navGroups.map((group) => (
          <SidebarNavGroup
            key={group.label}
            label={group.label}
            pathname={pathname}
            items={group.items}
          />
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
