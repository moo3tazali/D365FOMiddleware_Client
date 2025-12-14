import { useNavigate } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import { useCookies } from 'react-cookie';

import {
  PAGE_SIZE_COOKIE_MAX_AGE,
  PAGE_SIZE_COOKIE_NAME,
} from '@/constants/cookies';
import { useParsedPagination } from './use-parsed-pagination';

export const usePagination = () => {
  const [, setCookie] = useCookies([PAGE_SIZE_COOKIE_NAME]);

  const navigate = useNavigate();

  const { maxCount, skipCount } = useParsedPagination();

  // Get current values from URL params with defaults
  const currentPage = useMemo(
    () => Math.floor(skipCount / maxCount) + 1 || 1,
    [maxCount, skipCount]
  );

  const updateUrlAndTriggerChange = useCallback(
    (maxCount: number, skipCount: number) => {
      navigate({
        resetScroll: false,
        search: (prev) =>
          ({
            ...prev,
            maxCount,
            skipCount,
          } as never),
      });
    },
    [navigate]
  );

  const handlePageSizeChange = useCallback(
    (newSize: string) => {
      const size = Number(newSize);
      updateUrlAndTriggerChange(size, 0);
      setCookie(PAGE_SIZE_COOKIE_NAME, size, {
        maxAge: PAGE_SIZE_COOKIE_MAX_AGE,
      });
    },
    [updateUrlAndTriggerChange, setCookie]
  );

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      const newSkipCount = (currentPage - 2) * maxCount;
      updateUrlAndTriggerChange(maxCount, newSkipCount);
    }
  }, [currentPage, maxCount, updateUrlAndTriggerChange]);

  const handleNextPage = useCallback(
    (totalCount: number) => {
      const maxPage = Math.ceil(totalCount / maxCount);
      if (currentPage < maxPage) {
        const newSkipCount = currentPage * maxCount;
        updateUrlAndTriggerChange(maxCount, newSkipCount);
      }
    },
    [currentPage, maxCount, updateUrlAndTriggerChange]
  );

  const getNextPage = useCallback(
    (totalCount: number): { maxCount: number; skipCount: number } | null => {
      const maxPage = Math.ceil(totalCount / maxCount);
      if (currentPage < maxPage) {
        const newSkipCount = currentPage * maxCount;
        return {
          maxCount,
          skipCount: newSkipCount,
        };
      }
      return null;
    },
    [currentPage, maxCount]
  );

  return {
    currentPage,
    currentSize: maxCount,
    handlePageSizeChange,
    handlePreviousPage,
    handleNextPage,
    getNextPage,
  };
};
