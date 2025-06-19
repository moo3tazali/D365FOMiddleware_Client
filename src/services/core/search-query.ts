import Cookies from 'universal-cookie';

import { PAGE_SIZE_COOKIE_NAME } from '@/constants/cookies';
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination';
import { tryParse } from '@/lib/utils';
import type { RawFilter } from '@/interfaces/search-query';
import { z, type ZodSchema } from 'zod';

interface ParsedSearch {
  maxCount: number;
  skipCount: number;
}

export class SearchQuery {
  private static _instance: SearchQuery;
  private readonly _cookies: Cookies;

  private constructor() {
    this._cookies = new Cookies(null, { path: '/' });
  }

  public static getInstance(): SearchQuery {
    if (!SearchQuery._instance) {
      SearchQuery._instance = new SearchQuery();
    }
    return SearchQuery._instance;
  }

  public getParsedSearch(searchQuery?: Record<string, unknown>): ParsedSearch;

  public getParsedSearch<TFilter extends object>(
    searchQuery?: Record<string, unknown>,
    filterSchema?: ZodSchema<TFilter>
  ): ParsedSearch & TFilter;

  public getParsedSearch<TFilter extends object>(
    searchQuery?: Record<string, unknown>,
    filterSchema?: ZodSchema<TFilter>
  ): ParsedSearch | (ParsedSearch & TFilter) {
    const page = searchQuery?.page as string | undefined;
    const size = searchQuery?.size as string | undefined;
    const parsedPage = this._parsePage(page);
    const parsedSize = this._parseSize(size);
    const maxCount = parsedSize;
    const skipCount = (parsedPage - 1) * parsedSize;

    if (!searchQuery) {
      return {
        maxCount,
        skipCount,
      };
    }

    let parsedFilters: TFilter = {} as TFilter;

    Object.entries(searchQuery).forEach(([key, value]) => {
      if (key === 'filters' && typeof value === 'string') {
        parsedFilters = {
          ...parsedFilters,
          ...this._parseFilters<TFilter>(value),
        };
      } else {
        parsedFilters[key as keyof TFilter] = value as TFilter[keyof TFilter];
      }
    });

    parsedFilters = this._parseAndValidateFilters(parsedFilters, filterSchema);

    return {
      maxCount,
      skipCount,
      ...parsedFilters,
    };
  }

  private _parseSize(size?: string): number {
    const cookieRowPerPage = this._cookies.get(PAGE_SIZE_COOKIE_NAME) as
      | number
      | undefined;

    return tryParse<number>(size) || cookieRowPerPage || DEFAULT_PAGE_SIZE;
  }

  private _parsePage(page?: string): number {
    return tryParse<number>(page) || 1;
  }

  private _parseFilters<TFilter>(filters?: string): TFilter {
    const initial = {} as TFilter;

    if (!filters) return initial;

    const parsed = tryParse<RawFilter[]>(filters);
    if (!parsed) return initial;

    parsed.forEach(({ key, value }) => {
      if (!value) return;

      initial[key as keyof TFilter] = value as TFilter[keyof TFilter];
    });

    return initial;
  }

  private _parseAndValidateFilters<TFilter extends object>(
    filters: Partial<TFilter>,
    schema?: ZodSchema<TFilter>
  ): TFilter {
    if (schema instanceof z.ZodObject) {
      try {
        return schema.strip().parse(filters) as TFilter;
      } catch {
        console.error('Invalid filters');
        return {} as TFilter;
      }
    }

    return filters as TFilter;
  }
}
