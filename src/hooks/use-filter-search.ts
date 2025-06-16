import {
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { tryParse } from '@/lib/utils';
import type {
  QueryValue,
  RawFilter,
} from '@/interfaces/search-query';
import { useCallback, useMemo } from 'react';

export const useFilterSearch = () => {
  const navigate = useNavigate();

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

  const currentFilters = useMemo(() => {
    const raw = search.filters || '';
    const parsed = tryParse<RawFilter[]>(raw);
    return Array.isArray(parsed) ? parsed : [];
  }, [search]);

  const addFilter = useCallback(
    (key: string, value: QueryValue) => {
      const updatedFilters = [
        // remove old filter with same key if exists
        ...currentFilters.filter((f) => f.key !== key),
        { key, value },
      ];

      navigate({
        search: (prev) =>
          ({
            ...prev,
            page: 1, // reset page
            filters: JSON.stringify(updatedFilters),
          } as never),
      });
    },
    [currentFilters, navigate]
  );

  const removeFilter = useCallback(
    (key: string) => {
      if (!currentFilters.length) return;

      const updatedFilters = currentFilters.filter(
        (f) => f.key !== key
      );

      navigate({
        search: (prev) => {
          const result: Record<string, unknown> = {
            ...prev,
            filters: JSON.stringify(updatedFilters),
          };

          if ('page' in result) {
            result.page = 1; // reset page
          }

          return result as never;
        },
      });
    },
    [currentFilters, navigate]
  );

  return {
    addFilter,
    removeFilter,
  };
};
