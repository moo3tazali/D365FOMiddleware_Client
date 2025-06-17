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

export const useFilterSearch = <TFilter extends object>(
  keys: (keyof TFilter)[]
): [
  values: Record<
    keyof TFilter,
    TFilter[keyof TFilter] | undefined
  >,
  set: (key: keyof TFilter, value: QueryValue) => void,
  remove: (key: keyof TFilter) => void
] => {
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

  const set = useCallback(
    (key: keyof TFilter, value: QueryValue) => {
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

  const remove = useCallback(
    (key: keyof TFilter) => {
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

  const get = useCallback(
    (key: keyof TFilter) => {
      const filter = currentFilters.find(
        (f) => f.key === key
      );
      if (!filter) return;
      return filter?.value as TFilter[keyof TFilter];
    },
    [currentFilters]
  );

  const values = useMemo(() => {
    const result: Record<
      keyof TFilter,
      TFilter[keyof TFilter] | undefined
    > = {} as Record<
      keyof TFilter,
      TFilter[keyof TFilter] | undefined
    >;

    for (const key of keys || []) {
      result[key] = get(key);
    }
    return result;
  }, [get, keys]);

  return [values, set, remove];
};
