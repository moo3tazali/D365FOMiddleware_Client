import React, { createContext, useContext } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { PaginationRes } from '@/interfaces/api-res';
import { RowsPagination } from './rows-pagination';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[] | PaginationRes<TData>;
  isPending?: boolean;
  isPlaceholderData?: boolean;
  error?: string | null;
  header?: React.ReactNode | React.ElementType;
  footer?: React.ReactNode | React.ElementType;
  cardsBreakpoint?: number;
}

interface TableContextValue<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  message: string;
  isError: boolean;
  isPlaceholderData: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DataTableContext = createContext<TableContextValue<any, any> | null>(
  null
);

function useDataTableContext<TData, TValue>() {
  const ctx = useContext(DataTableContext);
  if (!ctx)
    throw new Error('useDataTableContext must be used inside DataTable');
  return ctx as TableContextValue<TData, TValue>;
}

function DataTable<TData, TValue>({
  columns,
  data,
  isPending,
  isPlaceholderData,
  error,
  header,
  footer,
  cardsBreakpoint = 1024,
}: DataTableProps<TData, TValue>) {
  const isMobile = useIsMobile(cardsBreakpoint);

  const items = React.useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data.items || [];
  }, [data]);

  const message = React.useMemo(() => {
    if (isPending) return 'Loading...';
    if (error) return error;
    return 'No results.';
  }, [isPending, error]);

  const paginationData = React.useMemo(() => {
    if (!data || Array.isArray(data)) return;
    return {
      pageSize: data.pageSize,
      pageNumber: data.pageNumber,
      totalCount: data.totalCount,
    };
  }, [data]);

  return (
    <DataTableContext.Provider
      value={{
        columns,
        data: items,
        message,
        isError: !!error,
        isPlaceholderData: isPlaceholderData || false,
      }}
    >
      <div className='space-y-4'>
        {header && typeof header === 'function'
          ? React.createElement(header)
          : header}

        {isMobile ? <MobileTableView /> : <DesktopTableView />}

        <RowsPagination paginationData={paginationData} />

        {footer && typeof footer === 'function'
          ? React.createElement(footer)
          : footer}
      </div>
    </DataTableContext.Provider>
  );
}

const DesktopTableView = React.memo(() => {
  const { columns, data, message, isError, isPlaceholderData } =
    useDataTableContext();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='relative'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length && !isError ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                {message}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {isPlaceholderData && (
        <div className='absolute inset-0 flex items-center justify-center backdrop-blur-xs rounded-md z-10'>
          <div className='size-10 border-3 border-primary border-t-transparent rounded-full animate-spin' />
        </div>
      )}
    </div>
  );
});

const MobileTableView = React.memo(() => {
  const { columns, data, message, isError, isPlaceholderData } =
    useDataTableContext();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (table.getRowModel().rows?.length === 0 || isError) {
    return (
      <Card className='h-56 text-center flex items-center justify-center'>
        {message}
      </Card>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      {table.getRowModel().rows.map((row) => (
        <Card key={row.id} className='p-4 relative'>
          <div className='space-y-3'>
            {row.getVisibleCells().map((cell) => {
              const header = table
                .getFlatHeaders()
                .find((h) => h.column.id === cell.column.id);

              const isActionCell = cell.id.includes('action');

              if (isActionCell)
                return (
                  <div key={cell.id} className='absolute top-1 end-1'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                );

              return (
                <div key={cell.id} className='grid grid-cols-3 gap-4'>
                  <span className='text-sm font-medium text-muted-foreground'>
                    {header &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </span>
                  <span className='text-sm col-span-2 pe-3'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </span>
                </div>
              );
            })}
          </div>
          {isPlaceholderData && (
            <div className='absolute inset-0 flex items-center justify-center backdrop-blur-xs rounded-md z-10'>
              <div className='size-10 border-3 border-primary border-t-transparent rounded-full animate-spin' />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
});

DesktopTableView.displayName = 'DesktopTableView';
MobileTableView.displayName = 'MobileTableView';

export { DataTable };
export type { ColumnDef, DataTableProps };
