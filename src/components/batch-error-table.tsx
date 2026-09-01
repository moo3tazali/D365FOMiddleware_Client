import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';

import { useServices } from '@/hooks/use-services';
import { DataTable, type ColumnDef } from '@/components/data-table';
import type {
  TDataBatchError,
  GroupedByMessageError,
  TDataBatchErrorEnhancedError,
} from '@/interfaces/data-batch-error';
import { Badge } from '@/components/ui/badge';
import { useParsedPagination } from '@/hooks/use-parsed-pagination';
import type { PaginationRes } from '@/interfaces/api-res';
import { formatExcelLineList } from '@/lib/dfo-skip-errors';

const MAX_SOURCE_IDS_VISIBLE = 8;

/**
 * Groups raw batch errors by (property, message) so each unique error appears once
 * with all affected source record IDs. Eliminates repetition when the same error
 * appears for many sources.
 */
export function groupErrorsByMessage(
  items: TDataBatchError[],
): GroupedByMessageError[] {
  const map = new Map<
    string,
    {
      property: string;
      message: string;
      sourceIds: Set<string>;
      excelLineNumbers: Set<number>;
    }
  >();

  for (const item of items) {
    const skip = toSkipErrorGroup(item);
    if (skip) {
      const key = `${skip.property}\n${skip.message}\n${skip.sourceRecordIds.join(',')}`;
      const existing = map.get(key);
      const excelLineNumbers = skip.excelLineNumbers ?? [];
      if (existing) {
        skip.sourceRecordIds.forEach((id) => existing.sourceIds.add(id));
        excelLineNumbers.forEach((line) => existing.excelLineNumbers.add(line));
      } else {
        map.set(key, {
          property: skip.property,
          message: skip.message,
          sourceIds: new Set(skip.sourceRecordIds),
          excelLineNumbers: new Set(excelLineNumbers),
        });
      }
      continue;
    }

    const errors: TDataBatchErrorEnhancedError[] =
      item.enhancedData?.errors && item.enhancedData.errors.length > 0
        ? item.enhancedData.errors
        : (item.errorMessages ?? []).map((msg) => ({
            property: msg.split(':')[0]?.trim() ?? 'Error',
            message: msg,
          }));

    const sourceIds = item.sourceRecordIds ?? [];
    for (const e of errors) {
      const key = `${e.property}\n${e.message}`;
      const existing = map.get(key);
      if (existing) {
        sourceIds.forEach((id) => existing.sourceIds.add(id));
      } else {
        map.set(key, {
          property: e.property,
          message: e.message,
          sourceIds: new Set(sourceIds),
          excelLineNumbers: new Set(),
        });
      }
    }
  }

  return Array.from(map.values()).map((v) => ({
    property: v.property,
    message: v.message,
    sourceRecordIds: Array.from(v.sourceIds).sort(
      (a, b) => Number(a) - Number(b) || a.localeCompare(b),
    ),
    ...(v.excelLineNumbers.size > 0
      ? {
          excelLineNumbers: [...v.excelLineNumbers].sort(
            (left, right) => left - right,
          ),
        }
      : {}),
  }));
}

function toSkipErrorGroup(item: TDataBatchError): GroupedByMessageError | null {
  const enhanced = item.enhancedData;
  if (enhanced?.kind !== 'custody-settlement-skip') return null;
  const uniqueId = String(enhanced.uniqueId ?? item.sourceRecordIds?.[0] ?? '')
    .trim();
  const phase = enhanced.phase === 'settle' ? 'Settlement skipped' : 'Upload skipped';
  const message = String(enhanced.error ?? item.errorMessages?.[0] ?? '').trim();
  const excelLineNumbers = Array.isArray(enhanced.excelLineNumbers)
    ? enhanced.excelLineNumbers
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)
    : [];
  return {
    property: phase,
    message,
    sourceRecordIds: uniqueId ? [uniqueId] : item.sourceRecordIds ?? [],
    excelLineNumbers,
  };
}

function ErrorCell({
  property,
  message,
  excelLineNumbers,
}: {
  property: string;
  message: string;
  excelLineNumbers?: number[];
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = message.length > 120;
  const displayMessage =
    isLong && !expanded ? `${message.slice(0, 120)}…` : message;
  const excelLines = formatExcelLineList(excelLineNumbers ?? []);

  return (
    <div className='flex gap-2 items-start text-left'>
      <div className='min-w-0 flex-1 space-y-1'>
        {property && property !== 'Error' && (
          <Badge
            variant='outline'
            color='muted'
            size='small'
            className='mb-1.5'
          >
            {property}
          </Badge>
        )}
        {excelLines && (
          <p className='text-xs text-muted-foreground'>
            Excel line {excelLines}
          </p>
        )}
        <p className='text-sm text-foreground leading-snug'>{displayMessage}</p>
        {isLong && (
          <button
            type='button'
            onClick={() => setExpanded((e) => !e)}
            className='text-xs text-muted-foreground hover:text-foreground underline'
          >
            {expanded ? 'Show less' : 'Show full message'}
          </button>
        )}
      </div>
    </div>
  );
}

function AffectedSourcesCell({
  sourceRecordIds,
}: {
  sourceRecordIds: string[];
}) {
  const [showAll, setShowAll] = useState(false);
  const total = sourceRecordIds.length;
  const visible = showAll
    ? sourceRecordIds
    : sourceRecordIds.slice(0, MAX_SOURCE_IDS_VISIBLE);
  const hasMore = total > MAX_SOURCE_IDS_VISIBLE;

  return (
    <div className='flex flex-wrap items-center gap-1.5'>
      {visible.map((id) => (
        <Badge key={id} variant='outline' color='primary' size='small'>
          {id}
        </Badge>
      ))}
      {hasMore && !showAll && (
        <button
          type='button'
          onClick={() => setShowAll(true)}
          className='text-xs text-primary hover:underline font-medium'
        >
          +{total - MAX_SOURCE_IDS_VISIBLE} more
        </button>
      )}
      {hasMore && showAll && (
        <button
          type='button'
          onClick={() => setShowAll(false)}
          className='text-xs text-muted-foreground hover:underline'
        >
          Collapse
        </button>
      )}
      <span className='text-xs text-muted-foreground ml-1'>
        ({total} {total === 1 ? 'source' : 'sources'})
      </span>
    </div>
  );
}

const columns: ColumnDef<GroupedByMessageError>[] = [
  {
    id: 'error',
    accessorKey: 'message',
    header: 'Error',
    cell: ({ row }) => (
      <ErrorCell
        property={row.original.property}
        message={row.original.message}
        excelLineNumbers={row.original.excelLineNumbers}
      />
    ),
  },
  {
    id: 'affectedSources',
    accessorKey: 'sourceRecordIds',
    header: 'Affected UniqueIds / source IDs',
    cell: ({ row }) => (
      <AffectedSourcesCell sourceRecordIds={row.original.sourceRecordIds} />
    ),
  },
];

export interface BatchErrorTableProps {
  /** Route pattern for useParams (e.g. '/dashboard/vendor/batch/$batchId/errors/') */
  routeFrom: string;
}

export function BatchErrorTable({ routeFrom }: BatchErrorTableProps) {
  const { dataBatchError } = useServices();
  const { batchId } = useParams({ from: routeFrom } as Parameters<
    typeof useParams
  >[0]);
  const { maxCount, skipCount } = useParsedPagination();
  const queryClient = useQueryClient();

  const { data, isPending, error, isPlaceholderData } = useQuery(
    dataBatchError.errorListQueryOptions({ maxCount, skipCount, batchId }),
  );

  const groupedData = useMemo(():
    | PaginationRes<GroupedByMessageError>
    | undefined => {
    if (!data) return undefined;
    const items = Array.isArray(data)
      ? data
      : ((data as PaginationRes<TDataBatchError>).items ?? []);
    const grouped = groupErrorsByMessage(items as TDataBatchError[]);
    if (Array.isArray(data))
      return grouped as unknown as PaginationRes<GroupedByMessageError>;
    return {
      ...(data as PaginationRes<TDataBatchError>),
      items: grouped,
    };
  }, [data]);

  return (
    <DataTable
      data={groupedData}
      columns={columns}
      error={error?.message}
      isPending={isPending}
      isPlaceholderData={isPlaceholderData}
      onNextPageHover={(nextPage) => {
        queryClient.prefetchQuery(
          dataBatchError.errorListQueryOptions({
            ...nextPage,
            batchId,
          }),
        );
      }}
    />
  );
}
