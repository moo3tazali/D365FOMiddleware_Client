import LogOut from 'lucide-react/dist/esm/icons/log-out';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLogout } from '@/routes/_auth/-hooks/use-logout';
import { useAuth } from '@/hooks/use-auth';

export function NavUser() {
  const user = useAuth((state) => state.user);

  const fallback = user?.username?.slice(0, 2)?.toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
          asChild
        >
          <div>
            <Avatar className='h-8 w-8 rounded-lg'>
              <AvatarImage
                src={user?.avatarPath ?? ''}
                alt={user?.username ?? ''}
              />
              <AvatarFallback className='rounded-lg'>{fallback}</AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>
                {user?.username ?? ''}
              </span>
              <span className='truncate text-xs'>{user?.email ?? ''}</span>
            </div>
            <LogoutButton />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

const LogoutButton = () => {
  const { onLogout, isPending } = useLogout();

  return (
    <button onClick={onLogout} disabled={isPending}>
      <LogOut />
    </button>
  );
};
