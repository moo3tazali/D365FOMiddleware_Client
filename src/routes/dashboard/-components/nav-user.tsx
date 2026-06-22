import LogOut from 'lucide-react/dist/esm/icons/log-out';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          aria-label='Log out'
          onClick={onLogout}
          disabled={isPending}
          className='size-8 shrink-0 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
        >
          <LogOut className='size-4' />
        </Button>
      </TooltipTrigger>
      <TooltipContent side='top'>Log out</TooltipContent>
    </Tooltip>
  );
};
