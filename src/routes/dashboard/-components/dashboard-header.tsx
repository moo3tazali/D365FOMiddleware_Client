import { memo } from 'react';
import { Link, useLocation } from '@tanstack/react-router';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { z } from 'zod';

export const DashboardHeader = () => {
  return (
    <header className='flex h-16 px-4 md:h-20 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 group-has-[[data-collapsible=icon]]/sidebar-wrapper:md:h-16'>
      <div className='flex items-center gap-2'>
        <SidebarTrigger className='-ml-1' />

        <Separator orientation='vertical' className='mr-2 !h-4' />

        <HeaderBreadcrumb />
      </div>

      <ThemeToggle />
    </header>
  );
};

const HeaderBreadcrumb = memo(() => {
  const { breadcrumbs } = useGenerateBreadCrumbs(['batch']);

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
  ({ name, to, isLast }: { name: string; to: string; isLast: boolean }) => {
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

// Batch ID schema validation
const batchIdSchema = z.string().ulid();

const useGenerateBreadCrumbs = (excludedSegments: string[] = []) => {
  const { pathname } = useLocation();

  // Get clean path segments
  const segments = pathname.split('/').filter(Boolean);

  const { breadcrumbs } = segments.reduce(
    (acc, segment) => {
      // Always update the full path
      const nextPath = `${acc.currentPath}/${segment}`;

      // Skip rendering this segment in the UI
      if (excludedSegments.includes(segment)) {
        return { ...acc, currentPath: nextPath };
      }

      let name: string;
      const isValidBatchId = batchIdSchema.safeParse(segment).success;

      if (isValidBatchId) {
        name = `Batch #...${segment.slice(-6)}`;
      } else {
        name = segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());
      }

      acc.breadcrumbs.push({
        name,
        to: nextPath,
        isLast: false, // we fix this later
      });

      return {
        breadcrumbs: acc.breadcrumbs,
        currentPath: nextPath,
      };
    },
    {
      breadcrumbs: [] as { name: string; to: string; isLast: boolean }[],
      currentPath: '',
    }
  );

  // fix isLast flag properly
  if (breadcrumbs.length > 0) {
    breadcrumbs[breadcrumbs.length - 1].isLast = true;
  }

  return { breadcrumbs };
};
