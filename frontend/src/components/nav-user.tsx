import { useState } from 'react';
import { ChevronsUpDown, LogOut, Mail } from 'lucide-react';

import { UpdateUserEmailDialog } from '@/components/auth/update-user-email-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useLogout } from '@/hooks/auth/use-logout';
import { useWebSession } from '@/hooks/auth/use-web-session';
import { isSuperAdminRole, roleLabel } from '@/lib/user-labels';

function initialsFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || '?'
  );
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const { data: user } = useWebSession();
  const { logout, isLoggingOut } = useLogout();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  if (!user) {
    return null;
  }

  const displayName = user.name ?? 'Operador';
  const subtitle = roleLabel(user.role);
  const canManageEmail = !isSuperAdminRole(user.role);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-md">
                  <AvatarFallback className="rounded-md bg-muted text-xs text-muted-foreground">
                    {initialsFromName(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {subtitle}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-md">
                    <AvatarFallback className="rounded-md bg-muted text-xs text-muted-foreground">
                      {initialsFromName(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email ?? `${user.unit} · Cartão ${user.cardNumber}`}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canManageEmail ? (
                <>
                  <DropdownMenuItem onClick={() => setEmailDialogOpen(true)}>
                    <Mail />
                    {user.email ? 'Atualizar e-mail' : 'Adicionar e-mail'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : null}
              <DropdownMenuItem
                disabled={isLoggingOut}
                onClick={() => {
                  void logout();
                }}
              >
                <LogOut />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {canManageEmail ? (
        <UpdateUserEmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          currentEmail={user.email}
        />
      ) : null}
    </>
  );
}
