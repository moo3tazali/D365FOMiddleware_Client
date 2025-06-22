import Cookies from 'universal-cookie';
import { z, type ZodSchema } from 'zod';

import { PAGE_SIZE_COOKIE_NAME } from '@/constants/cookies';
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination';
import { tryParse } from '@/lib/utils';

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

  public getParsedSearch<T extends object>(
    schema: ZodSchema<T>,
    searchQuery?: Record<string, unknown>
  ): T {
    if (!(schema instanceof z.ZodObject)) {
      throw new Error('Invalid schema');
    }

    const cookiesMaxCount = this._cookies.get(PAGE_SIZE_COOKIE_NAME) as
      | number
      | undefined;
    const maxCount =
      tryParse<number>(searchQuery?.maxCount as string | undefined) ||
      cookiesMaxCount ||
      DEFAULT_PAGE_SIZE;
    const skipCount =
      tryParse<number>(searchQuery?.skipCount as string | undefined) || 0;

    const newSearchQuery = {
      ...searchQuery,
      maxCount,
      skipCount,
    };

    try {
      return schema.strip().parse(newSearchQuery) as T;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          Object.entries(error.flatten().fieldErrors)
            .map(
              ([field, messages]) => `${field}: ${(messages || []).join(', ')}`
            )
            .join(' | ')
        );
      }

      throw error;
    }
  }
}
