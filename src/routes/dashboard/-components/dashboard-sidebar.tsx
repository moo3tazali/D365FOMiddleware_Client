import { Link } from '@tanstack/react-router';

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
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/ui/logo';
import { NavUser } from './nav-user';
import { useNavItems } from '../-hooks/use-nav-items';
import { createElement } from 'react';

export function DashboardSidebar() {
  const { items } = useNavItems();

  return (
    <Sidebar variant='sidebar' collapsible='icon'>
      <SidebarHeader className='h-16 md:h-20 group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 group-has-[[data-collapsible=icon]]/sidebar-wrapper:md:h-16 flex justify-center items-center'>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavLogo />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='gap-2'>
              {items.map((item) => (
                <NavMain key={item.title} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

const NavLogo = () => {
  const { open } = useSidebar();

  return (
    <Logo
      className={open ? '' : 'w-7'}
      orientation={open ? 'horizontal' : 'small'}
    />
  );
};

const NavMain = ({
  title,
  url,
  icon,
  isActive,
}: {
  title: string;
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  isActive: boolean;
}) => {
  return (
    <SidebarMenuItem key={title}>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link to={url}>
          {createElement(icon)}

          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
