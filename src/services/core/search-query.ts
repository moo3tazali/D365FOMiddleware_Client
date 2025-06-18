import Cookies from 'universal-cookie';

import { PAGE_SIZE_COOKIE_NAME } from '@/constants/cookies';
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination';
import { tryParse } from '@/lib/utils';
import type { RawFilter } from '@/interfaces/search-query';

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

  public getParsedSearch = <TFilter extends object>(
    searchQuery?: Record<string, unknown>
  ): ParsedSearch & TFilter => {
    const page = searchQuery?.page as string | undefined;
    const size = searchQuery?.size as string | undefined;
    const filters = searchQuery?.filters as string | undefined;

    const parsedPage = this._parsePage(page);
    const parsedSize = this._parseSize(size);
    const parsedFilters = this._parseFilters<TFilter>(filters);

    return {
      maxCount: parsedSize,
      skipCount: (parsedPage - 1) * parsedSize,
      ...parsedFilters,
    };
  };

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
}
