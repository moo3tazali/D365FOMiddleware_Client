'use client';

import { memo } from 'react';
import ChevronLeftIcon from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRightIcon from 'lucide-react/dist/esm/icons/chevron-right';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePagination } from '@/hooks/use-pagination';
import { ROWS_PER_PAGE } from '@/constants/pagination';

interface PaginationProps {
  pageSize: number;
  pageNumber: number;
  totalCount: number;
}

interface RowsPaginationProps {
  paginationData?: PaginationProps;
}

export const RowsPagination = memo(
  ({ paginationData }: RowsPaginationProps) => {
    const {
      currentPage,
      currentSize,
      handlePageSizeChange,
      handlePreviousPage,
      handleNextPage,
    } = usePagination();

    const disabled = !paginationData;

    // Calculate display values using URL params
    const startItem = (currentPage - 1) * currentSize + 1;
    const endItem = Math.min(
      currentPage * currentSize,
      paginationData?.totalCount || 0
    );
    const maxPage = Math.ceil((paginationData?.totalCount || 0) / currentSize);

    return (
      <div className='w-full flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <Label htmlFor='rows-per-page' className='whitespace-nowrap'>
            Rows per page:
          </Label>
          <Select
            value={currentSize.toString()}
            onValueChange={handlePageSizeChange}
            disabled={disabled}
          >
            <SelectTrigger className='w-[75px]' id='rows-per-page'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROWS_PER_PAGE.map((row) => (
                <SelectItem key={row} value={row.toString()}>
                  {row}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground whitespace-nowrap'>
            {startItem}-{endItem} of {paginationData?.totalCount || 0}
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  aria-label='Go to previous page'
                  size='icon'
                  variant='ghost'
                  disabled={currentPage === 1 || disabled}
                  onClick={handlePreviousPage}
                >
                  <ChevronLeftIcon className='h-4 w-4' />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  aria-label='Go to next page'
                  size='icon'
                  variant='ghost'
                  disabled={currentPage >= maxPage || disabled}
                  onClick={() =>
                    handleNextPage(paginationData?.totalCount || 0)
                  }
                >
                  <ChevronRightIcon className='h-4 w-4' />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    );
  }
);

RowsPagination.displayName = 'RowsPagination';
