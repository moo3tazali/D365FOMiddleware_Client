import { useMemo } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useCookies } from 'react-cookie';

import { PAGE_SIZE_COOKIE_NAME } from '@/constants/cookies';
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination';
import { tryParse } from '@/lib/utils';
import type { RawFilter } from '@/interfaces/search-query';

interface ParsedSearch {
  maxCount: number;
  skipCount: number;
}

export const useParsedSearch = <
  TFilter extends object
>(): ParsedSearch & TFilter => {
  const [{ rows_per_page }] = useCookies([
    PAGE_SIZE_COOKIE_NAME,
  ]);

  const search = useSearch({
    strict: false,
    structuralSharing: true,
    select: (s: {
      page?: string;
      size?: string;
      filters?: string;
    }) => ({
      page: s.page ? +s.page : undefined,
      size: s.size ? +s.size : undefined,
      filters: s.filters,
    }),
  });

  const page = search.page || 1;
  const size =
    search.size || rows_per_page || DEFAULT_PAGE_SIZE;

  const filters = useMemo(() => {
    const initial = {} as TFilter;

    if (!search.filters) return initial;

    const parsed = tryParse<RawFilter[]>(search.filters);
    if (!parsed) return initial;

    parsed.forEach(({ key, value }) => {
      if (!value) return;

      initial[key as keyof TFilter] =
        value as TFilter[keyof TFilter];
    });

    return initial;
  }, [search.filters]);

  return {
    maxCount: size,
    skipCount: (page - 1) * size,
    ...filters,
  };
};
