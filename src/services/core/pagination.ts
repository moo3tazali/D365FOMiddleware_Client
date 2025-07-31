import { z } from 'zod';
import Cookies from 'universal-cookie';

import {
  PAGE_SIZE_COOKIE_MAX_AGE,
  PAGE_SIZE_COOKIE_NAME,
} from '@/constants/cookies';
import { DEFAULT_PAGE_SIZE, ROWS_PER_PAGE } from '@/constants/pagination';

export const PaginationSchema = z.object({
  maxCount: z.number().optional(),
  skipCount: z.number().optional(),
});

interface TPagination {
  maxCount: number;
  skipCount: number;
}

export class Pagination {
  private static _instance: Pagination;
  private readonly _cookies: Cookies;
  private readonly _cookieId = PAGE_SIZE_COOKIE_NAME;
  private readonly _rowsPerPage: number[] = ROWS_PER_PAGE;

  private constructor() {
    this._cookies = new Cookies(null, {
      maxAge: PAGE_SIZE_COOKIE_MAX_AGE,
    });
  }

  // singleton pattern
  public static getInstance(): Pagination {
    if (!Pagination._instance) {
      Pagination._instance = new Pagination();
    }
    return Pagination._instance;
  }

  public get defaultValues(): TPagination {
    return {
      maxCount: this.rowsPerPage,
      skipCount: 0,
    };
  }

  public get rowsPerPage(): number {
    return (
      (this._cookies.get(this._cookieId) as number | undefined) ||
      DEFAULT_PAGE_SIZE
    );
  }

  public set rowsPerPage(newSize: number | string) {
    const size = Number(newSize);
    this._cookies.set(this._cookieId, size, {
      maxAge: PAGE_SIZE_COOKIE_MAX_AGE,
    });
  }

  public getFromSearch(search: {
    maxCount?: unknown;
    skipCount?: unknown;
  }): TPagination {
    if (search?.maxCount === undefined || search?.skipCount === undefined) {
      return this.defaultValues;
    }

    const parsed = PaginationSchema.safeParse({
      maxCount: this._tryParse<number>(search?.maxCount as string),
      skipCount: this._tryParse<number>(search?.skipCount as string),
    });

    if (!parsed.success) {
      return this.defaultValues;
    }

    const { maxCount, skipCount } = parsed.data;

    if (maxCount === undefined || skipCount === undefined) {
      return this.defaultValues;
    }

    const isValidMaxCount = this._rowsPerPage.includes(maxCount ?? -1);

    return {
      maxCount: isValidMaxCount ? maxCount : this.rowsPerPage,
      skipCount: skipCount ?? 0,
    };
  }

  private _tryParse<T>(value?: string): T | undefined {
    if (!value) return;
    try {
      return JSON.parse(value) as T;
    } catch {
      return;
    }
  }
}
