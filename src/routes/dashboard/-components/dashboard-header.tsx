import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Link, useLocation } from '@tanstack/react-router';
import { memo } from 'react';

export const DashboardHeader = () => {
  return (
    <header className='flex h-16 md:h-20 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 group-has-[[data-collapsible=icon]]/sidebar-wrapper:md:h-16'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />

        <Separator
          orientation='vertical'
          className='mr-2 !h-4'
        />

        <HeaderBreadcrumb />
      </div>
    </header>
  );
};

const HeaderBreadcrumb = memo(() => {
  const { breadcrumbs } = useGenerateBreadCrumbs();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <CrumbItem key={index} {...crumb} />
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
});

HeaderBreadcrumb.displayName = 'HeaderBreadcrumb';

const CrumbItem = memo(
  ({
    name,
    to,
    isLast,
  }: {
    name: string;
    to: string;
    isLast: boolean;
  }) => {
    if (isLast)
      return (
        <BreadcrumbItem>
          <BreadcrumbPage>{name}</BreadcrumbPage>
        </BreadcrumbItem>
      );

    return (
      <>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={to}>{name}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
      </>
    );
  }
);

CrumbItem.displayName = 'CrumbItem';

const useGenerateBreadCrumbs = () => {
  const { pathname } = useLocation();

  const segments = pathname.split('/').filter(Boolean);

  let path = '';

  const breadcrumbs = segments.map((segment, index) => {
    // eslint-disable-next-line react-compiler/react-compiler
    path += `/${segment}`;

    const name = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return {
      name,
      to: path,
      isLast: index === segments.length - 1,
    };
  });

  return { breadcrumbs };
};
