import { useCallback, useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { tryParse } from '@/lib/utils';
import type { QueryValue } from '@/interfaces/search-query';

export const useSearchQuery = <T extends object>(
  keys: (keyof T)[]
): [
  values: Record<keyof T, T[keyof T] | undefined>,
  setSearchParam: (key: keyof T, value: QueryValue) => void,
  removeSearchParam: (key: keyof T) => void,
  resetSearch: () => void
] => {
  const navigate = useNavigate();

  const search = useSearch({
    strict: false,
    structuralSharing: true,
  });

  // Convert current search params into a Map for easier access
  const currentSearchMap = useMemo(() => {
    const map = new Map<string, QueryValue>();

    for (const [key, value] of Object.entries(search)) {
      const parsedValue = tryParse<QueryValue>(value as string);
      if (parsedValue !== null) {
        map.set(key, parsedValue);
      }
    }

    return map;
  }, [search]);

  const setSearchParam = useCallback(
    (key: keyof T, value: QueryValue) => {
      navigate({
        search: (prev) =>
          ({
            ...prev,
            ...('skipCount' in prev ? { skipCount: 0 } : {}), // Reset to first page
            [key]: value,
          } as never),
      });
    },
    [navigate]
  );

  const removeSearchParam = useCallback(
    (key: keyof T) => {
      const updated = new URLSearchParams();

      for (const [k, v] of currentSearchMap.entries()) {
        if (k === 'skipCount') continue;
        if (k !== key) updated.set(k, String(v));
      }

      const updatedSearch: Record<string, string> = {};
      for (const [k, v] of updated.entries()) {
        updatedSearch[k] = v;
      }

      navigate({
        search: updatedSearch as never,
      });
    },
    [navigate, currentSearchMap]
  );

  const resetSearch = useCallback(() => {
    navigate({
      search: {
        skipCount: 0,
      } as never,
    });
  }, [navigate]);

  const values = useMemo(() => {
    const result = {} as Record<keyof T, T[keyof T] | undefined>;

    for (const key of keys) {
      const value = currentSearchMap.get(key as string);
      result[key] = value as T[keyof T] | undefined;
    }

    return result;
  }, [currentSearchMap, keys]);

  return [values, setSearchParam, removeSearchParam, resetSearch];
};
