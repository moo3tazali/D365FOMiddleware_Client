import React from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

import {
  ClampText,
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
  error?: string | null;
  header?: React.ReactNode | React.ElementType;
  footer?: React.ReactNode | React.ElementType;
}

interface TableViewProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  message: string;
  isError: boolean;
}

function DataTable<TData, TValue>({
  columns,
  data,
  isPending,
  error,
  header,
  footer,
}: DataTableProps<TData, TValue>) {
  const isMobile = useIsMobile(1024);

  const items = React.useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data.items || [];
  }, [data]);

  const message = React.useMemo(() => {
    if (isPending) {
      return 'Loading...';
    }

    if (error) {
      return error;
    }

    return 'No results.';
  }, [isPending, error]);

  const paginationData = React.useMemo(() => {
    if (!data) return;
    if (Array.isArray(data)) return;
    return {
      pageSize: data.pageSize,
      pageNumber: data.pageNumber,
      totalCount: data.totalCount,
    };
  }, [data]);

  return (
    <div className='space-y-4'>
      {header && typeof header === 'function'
        ? React.createElement(header)
        : header}

      {isMobile ? (
        <MobileTableView
          columns={columns}
          data={items}
          message={message}
          isError={!!error}
        />
      ) : (
        <DesktopTableView
          columns={columns}
          data={items}
          message={message}
          isError={!!error}
        />
      )}

      <RowsPagination paginationData={paginationData} />

      {footer && typeof footer === 'function'
        ? React.createElement(footer)
        : footer}
    </div>
  );
}

const DesktopTableView = React.memo(
  <TData, TValue>({
    columns,
    data,
    message,
    isError,
  }: TableViewProps<TData, TValue>) => {
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length && !isError ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={
                  row.getIsSelected() && 'selected'
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <ClampText>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </ClampText>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className='h-24 text-center align-middle'
              >
                {message}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  }
) as <TData, TValue>(
  props: TableViewProps<TData, TValue>
) => React.JSX.Element;

const MobileTableView = React.memo(
  <TData, TValue>({
    columns,
    data,
    message,
    isError,
  }: TableViewProps<TData, TValue>) => {
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
          <Card key={row.id} className='p-4'>
            <div className='space-y-3'>
              {row.getVisibleCells().map((cell) => {
                const header = table
                  .getFlatHeaders()
                  .find(
                    (h) => h.column.id === cell.column.id
                  );

                return (
                  <div
                    key={cell.id}
                    className='grid grid-cols-3 gap-4'
                  >
                    <span className='text-sm font-medium text-muted-foreground'>
                      {header &&
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </span>
                    <span className='text-sm col-span-2'>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    );
  }
) as <TData, TValue>(
  props: TableViewProps<TData, TValue>
) => React.JSX.Element;

export { DataTable };
export type { ColumnDef, DataTableProps };
