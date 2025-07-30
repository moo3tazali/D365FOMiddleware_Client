import { useCallback, useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import type { z, ZodObject, ZodRawShape } from 'zod';
import { tryParse } from '@/lib/utils';
import { useParsedPagination } from './use-parsed-pagination';
import type { QueryValue } from '@/interfaces/search-query';

// 🔁 Function overloads
export function useSearchQuery<T extends ZodObject<ZodRawShape>>(
  schema: T,
  options: { withPagination: true }
): [
  values: z.infer<T> & { maxCount: number; skipCount: number },
  setSearchParam: (
    key: keyof (z.infer<T> & { maxCount?: number; skipCount?: number }),
    value: QueryValue
  ) => void,
  removeSearchParam: (key: keyof z.infer<T>) => void,
  resetSearch: () => void
];

export function useSearchQuery<T extends ZodObject<ZodRawShape>>(
  schema: T,
  options?: { withPagination?: false }
): [
  values: z.infer<T>,
  setSearchParam: (key: keyof z.infer<T>, value: QueryValue) => void,
  removeSearchParam: (key: keyof z.infer<T>) => void,
  resetSearch: () => void
];

// ✅ Implementation
export function useSearchQuery<T extends ZodObject<ZodRawShape>>(
  schema: T,
  options?: { withPagination?: boolean }
) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false, structuralSharing: true });
  const { maxCount, skipCount } = useParsedPagination();

  type TValue = z.infer<T>;
  const shape = schema.shape as ZodRawShape;
  const schemaKeys = Object.keys(shape) as (keyof TValue)[];
  const withPagination = options?.withPagination ?? false;

  const currentSearchMap = useMemo(() => {
    const map = new Map<string, QueryValue>();

    // ✅ Add pagination if enabled
    if (withPagination) {
      map.set('maxCount', maxCount);
      map.set('skipCount', skipCount);
    }

    for (const key of schemaKeys) {
      const raw = (search as Record<string, unknown>)[key as string];
      if ((key === 'skipCount' || key === 'maxCount') && withPagination)
        continue;
      if (raw !== undefined) {
        const parsed = tryParse<QueryValue>(raw as string);
        if (parsed !== undefined) {
          const result = shape[key as string].safeParse(parsed);
          if (result.success) {
            map.set(key as string, result.data);
          }
        }
      }
    }

    return map;
  }, [search, shape, schemaKeys, withPagination, maxCount, skipCount]);

  const setSearchParam = useCallback(
    (key: string, value: QueryValue) => {
      navigate({
        search: (prev) =>
          ({
            ...prev,
            ...('skipCount' in prev ? { skipCount: 0 } : {}),
            [key]: JSON.stringify(value),
          } as never),
      });
    },
    [navigate]
  );

  const removeSearchParam = useCallback(
    (key: string) => {
      const updated = new URLSearchParams();

      for (const [k, v] of currentSearchMap.entries()) {
        if (k === 'skipCount' && withPagination) continue;
        if (k !== key) updated.set(k, String(v));
      }

      const updatedSearch: Record<string, string> = {};
      for (const [k, v] of updated.entries()) {
        updatedSearch[k] = v;
      }

      navigate({ search: updatedSearch as never });
    },
    [navigate, currentSearchMap, withPagination]
  );

  const resetSearch = useCallback(() => {
    navigate({ search: { skipCount: 0 } as never });
  }, [navigate]);

  const values = useMemo(() => {
    const result: Record<string, unknown> = {};

    for (const key of schemaKeys) {
      const value = currentSearchMap.get(key as string);
      result[key as string] = value;
    }

    if (withPagination) {
      result['maxCount'] = currentSearchMap.get('maxCount');
      result['skipCount'] = currentSearchMap.get('skipCount');
    }

    return result;
  }, [currentSearchMap, schemaKeys, withPagination]);

  return [values, setSearchParam, removeSearchParam, resetSearch] as const;
}
