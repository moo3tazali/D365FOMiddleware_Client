import {
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import { useCookies } from 'react-cookie';

import {
  PAGE_SIZE_COOKIE_MAX_AGE,
  PAGE_SIZE_COOKIE_NAME,
} from '@/constants/cookies';
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination';

export const usePagination = () => {
  const [{ rows_per_page }, setCookie] = useCookies([
    PAGE_SIZE_COOKIE_NAME,
  ]);
  const navigate = useNavigate();
  const search = useSearch({
    strict: false,
    structuralSharing: true,
    select: (s: { page?: string; size?: string }) => ({
      page: s.page ? +s.page : undefined,
      size: s.size ? +s.size : undefined,
    }),
  });

  // Get current values from URL params with defaults
  const currentPage = useMemo(
    () => search.page || 1,
    [search.page]
  );

  const currentSize = useMemo(
    () =>
      search.size ||
      (rows_per_page as number) ||
      DEFAULT_PAGE_SIZE,
    [search.size, rows_per_page]
  );

  const updateUrlAndTriggerChange = useCallback(
    (page: number, size: number) => {
      navigate({
        resetScroll: false,
        search: (prev) =>
          ({
            ...prev,
            page,
            size,
          } as never),
      });
    },
    [navigate]
  );

  const handlePageSizeChange = useCallback(
    (newSize: string) => {
      const size = Number(newSize);
      updateUrlAndTriggerChange(1, size);
      setCookie(PAGE_SIZE_COOKIE_NAME, size, {
        maxAge: PAGE_SIZE_COOKIE_MAX_AGE,
      });
    },
    [updateUrlAndTriggerChange, setCookie]
  );

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      updateUrlAndTriggerChange(
        currentPage - 1,
        currentSize
      );
    }
  }, [currentPage, currentSize, updateUrlAndTriggerChange]);

  const handleNextPage = useCallback(
    (totalCount: number) => {
      const maxPage = Math.ceil(totalCount / currentSize);
      if (currentPage < maxPage) {
        updateUrlAndTriggerChange(
          currentPage + 1,
          currentSize
        );
      }
    },
    [currentPage, currentSize, updateUrlAndTriggerChange]
  );

  return {
    currentPage,
    currentSize,
    handlePageSizeChange,
    handlePreviousPage,
    handleNextPage,
  };
};
