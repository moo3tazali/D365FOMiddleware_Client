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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isPending?: boolean;
  error?: Error | null;
  header?: React.ReactNode;
  footer?: React.ReactNode;
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
  const isMobile = useIsMobile();

  const message = React.useMemo(() => {
    if (isPending) {
      return 'Loading...';
    }

    if (error) {
      return error.message;
    }

    return 'No results.';
  }, [isPending, error]);

  return (
    <div className='space-y-4'>
      {header && header}

      {isMobile ? (
        <MobileTableView
          columns={columns}
          data={data}
          message={message}
          isError={!!error}
        />
      ) : (
        <DesktopTableView
          columns={columns}
          data={data}
          message={message}
          isError={!!error}
        />
      )}

      {footer && footer}
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
      <div className='rounded-md border'>
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
            {table.getRowModel().rows?.length &&
            !isError ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={
                    row.getIsSelected() && 'selected'
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {message}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
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
        <div className='h-24 text-center flex items-center justify-center'>
          {message}
        </div>
      );
    }

    return (
      <div className='space-y-4'>
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
                    className='flex items-center justify-between gap-4'
                  >
                    <span className='text-sm font-medium text-muted-foreground'>
                      {header &&
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </span>
                    <span className='text-sm text-right'>
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
