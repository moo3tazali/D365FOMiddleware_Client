import { useCookies } from 'react-cookie';

import { tryParse } from '@/lib/utils';

import { DEFAULT_PAGE_SIZE, ROWS_PER_PAGE } from '@/constants/pagination';
import { useSearch } from '@tanstack/react-router';

import { PAGE_SIZE_COOKIE_NAME } from '@/constants/cookies';
import { PaginationSchema } from '@/schemas/pagination-schema';

export const useParsedPagination = () => {
  const [{ rows_per_page }] = useCookies([PAGE_SIZE_COOKIE_NAME]);
  const cookiesMaxSize = rows_per_page as number | undefined;
  const fallbackMax = cookiesMaxSize || DEFAULT_PAGE_SIZE;

  const search = useSearch({ strict: false, structuralSharing: true });

  return {
    ...getParsedPagination(search, fallbackMax),
  };
};

const getParsedPagination = (
  obj: {
    maxCount?: unknown;
    skipCount?: unknown;
  },
  fallbackMax: number
) => {
  if (!obj || obj?.maxCount === undefined || obj?.skipCount === undefined) {
    return {
      maxCount: fallbackMax,
      skipCount: 0,
    };
  }

  const parsed = PaginationSchema.safeParse({
    maxCount: tryParse<number>(obj?.maxCount as string),
    skipCount: tryParse<number>(obj?.skipCount as string),
  });

  if (!parsed.success) {
    return {
      maxCount: fallbackMax,
      skipCount: 0,
    };
  }

  const { maxCount, skipCount } = parsed.data;

  const isValidMaxCount = ROWS_PER_PAGE.includes(maxCount ?? -1);

  return {
    maxCount: isValidMaxCount ? maxCount! : fallbackMax,
    skipCount: skipCount ?? 0,
  };
};
