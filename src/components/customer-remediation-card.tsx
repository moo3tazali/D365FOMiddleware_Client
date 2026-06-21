import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import SearchIcon from 'lucide-react/dist/esm/icons/search';
import UsersIcon from 'lucide-react/dist/esm/icons/users';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Wrench from 'lucide-react/dist/esm/icons/wrench';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';

import { useServices } from '@/hooks/use-services';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateCustomerModal } from '@/components/create-customer-modal';
import type { TDataBatchMissingMasterData } from '@/interfaces/data-batch';

const DEBOUNCE_MS = 400;
const PAGE_SIZE = 30;

// ─────────────────────────────────────────────────────────────────────────────
// Status badge helpers
// ─────────────────────────────────────────────────────────────────────────────

function CreationStatusBadge({
  status,
}: {
  status: TDataBatchMissingMasterData['creationStatus'];
}) {
  const map: Record<string, { label: string; color: string }> = {
    missing: {
      label: 'Missing',
      color:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    },
    creating: {
      label: 'Creating…',
      color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    },
    created: {
      label: 'Created',
      color:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    },
    create_failed: {
      label: 'Failed',
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    },
  };
  const { label, color } = map[status] ?? { label: status, color: '' };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}
    >
      {label}
    </span>
  );
}

function ReprocessStatusBadge({
  status,
}: {
  status: TDataBatchMissingMasterData['reprocessStatus'];
}) {
  if (status === 'not_started') return null;
  const map: Record<string, { label: string; color: string }> = {
    pending: {
      label: 'Pending',
      color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
    },
    processing: {
      label: 'Processing…',
      color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    },
    succeeded: {
      label: 'Reprocessed ✓',
      color:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    },
    failed: {
      label: 'Reprocess Failed',
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    },
  };
  const { label, color } = map[status] ?? { label: status, color: '' };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single missing master data row
// ─────────────────────────────────────────────────────────────────────────────

interface MissingMasterDataRowProps {
  record: TDataBatchMissingMasterData;
  onCreateClick: (record: TDataBatchMissingMasterData) => void;
}

function MissingMasterDataRow({
  record,
  onCreateClick,
}: MissingMasterDataRowProps) {
  const isCreated = record.creationStatus === 'created';
  const isCreating = record.creationStatus === 'creating';
  const creationFailed = record.creationStatus === 'create_failed';
  const isReprocessing = record.reprocessStatus === 'processing';
  const isResolved = record.reprocessStatus === 'succeeded';

  return (
    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-4 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors'>
      <div className='flex-1 min-w-0 space-y-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate'>
            {record.missingValue}
          </span>
          <Badge variant='outline' color='muted' size='small'>
            {record.missingField}
          </Badge>
          <span className='text-xs text-zinc-400 dark:text-zinc-500 shrink-0'>
            {record.affectedCount} {record.affectedCount === 1 ? 'row' : 'rows'}
          </span>
        </div>
        <div className='flex flex-wrap items-center gap-1.5'>
          <CreationStatusBadge status={record.creationStatus} />
          <ReprocessStatusBadge status={record.reprocessStatus} />
          {creationFailed && record.createErrorMessage && (
            <span className='text-xs text-destructive truncate max-w-xs'>
              {record.createErrorMessage}
            </span>
          )}
        </div>
      </div>

      <div className='flex items-center gap-2 shrink-0'>
        {isResolved ? (
          <div className='flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
            <CheckCircle2 className='h-4 w-4' />
            <span>Resolved</span>
          </div>
        ) : isCreating || isReprocessing ? (
          <div className='flex items-center gap-1.5 text-xs font-semibold text-zinc-500'>
            <Loader2 className='h-4 w-4 animate-spin text-primary' />
            <span>{isCreating ? 'Creating…' : 'Reprocessing…'}</span>
          </div>
        ) : !isCreated ? (
          <Button
            size='sm'
            onClick={() => onCreateClick(record)}
            className='h-8 gap-1.5 text-xs font-semibold px-3'
          >
            <Wrench className='h-3.5 w-3.5' />
            Create customer
          </Button>
        ) : null}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Customer Remediation Card
// ─────────────────────────────────────────────────────────────────────────────

interface CustomerRemediationCardProps {
  batchId: string;
  initialTotal?: number;
  initialAffectedRows?: number;
}

export function CustomerRemediationCard({
  batchId,
  initialTotal,
  initialAffectedRows,
}: CustomerRemediationCardProps) {
  const { dataBatch } = useServices();
  const queryClient = useQueryClient();

  const [searchRaw, setSearchRaw] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] =
    useState<TDataBatchMissingMasterData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchRaw.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchRaw]);

  const infiniteQueryOpts = dataBatch.missingMasterDataInfiniteQueryOptions(
    batchId,
    { type: 'customer', search: search || undefined, limit: PAGE_SIZE },
  );

  const {
    data,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(infiniteQueryOpts);

  // Flatten all pages into a single list
  const records = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  const total = data?.pages[0]?.pagination.total ?? initialTotal ?? 0;
  const totalAffectedRows =
    initialAffectedRows ?? records.reduce((sum, r) => sum + r.affectedCount, 0);

  const handleCreateClick = (record: TDataBatchMissingMasterData) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleModalSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: dataBatch.queryKey });
  }, [queryClient, dataBatch.queryKey]);

  const endReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className='rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden'>
      {/* Card header */}
      <div className='px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800'>
        <div className='flex items-start justify-between gap-4 mb-3'>
          <div className='flex items-center gap-3'>
            <div className='p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg'>
              <UsersIcon className='h-5 w-5 text-indigo-600 dark:text-indigo-400' />
            </div>
            <div>
              <h3 className='text-base font-bold text-zinc-900 dark:text-zinc-100'>
                Customers
              </h3>
              <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                Missing customer master data records
              </p>
            </div>
          </div>
          <div className='flex items-center gap-4 text-right shrink-0'>
            <div>
              <p className='text-xl font-bold text-zinc-900 dark:text-zinc-100'>
                {total.toLocaleString('en-US')}
              </p>
              <p className='text-xs text-zinc-400 dark:text-zinc-500'>
                missing
              </p>
            </div>
            {totalAffectedRows > 0 && (
              <div>
                <p className='text-xl font-bold text-zinc-900 dark:text-zinc-100'>
                  {totalAffectedRows.toLocaleString('en-US')}
                </p>
                <p className='text-xs text-zinc-400 dark:text-zinc-500'>
                  affected rows
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search input — stays fixed while list scrolls */}
        <div className='relative'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400' />
          <Input
            className='pl-9 h-9 text-sm'
            placeholder='Search by tax number or customer ID…'
            value={searchRaw}
            onChange={(e) => setSearchRaw(e.target.value)}
          />
          {searchRaw && (
            <button
              type='button'
              onClick={() => setSearchRaw('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600'
            >
              <XCircle className='h-4 w-4' />
            </button>
          )}
        </div>
      </div>

      {/* Virtualized list with bounded height */}
      <div className='h-[420px] overflow-hidden'>
        {isPending ? (
          <div className='h-full flex items-center justify-center gap-2 text-sm text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin text-primary' />
            Loading records…
          </div>
        ) : isError ? (
          <div className='h-full flex flex-col items-center justify-center gap-2 text-sm text-destructive p-6'>
            <AlertCircle className='h-5 w-5' />
            <p>Failed to load records</p>
            {error?.message && (
              <p className='text-xs text-muted-foreground'>{error.message}</p>
            )}
          </div>
        ) : records.length === 0 ? (
          <div className='h-full flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground p-6'>
            <CheckCircle2 className='h-5 w-5 text-emerald-500' />
            <p className='font-medium'>
              {search ? 'No records match your search' : 'No missing customers'}
            </p>
          </div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            data={records}
            endReached={endReached}
            overscan={200}
            itemContent={(_index, record) => (
              <MissingMasterDataRow
                key={record.id}
                record={record}
                onCreateClick={handleCreateClick}
              />
            )}
            components={{
              Footer: () =>
                isFetchingNextPage ? (
                  <div className='flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground'>
                    <Loader2 className='h-3 w-3 animate-spin' />
                    Loading more…
                  </div>
                ) : null,
            }}
          />
        )}
      </div>

      {selectedRecord && (
        <CreateCustomerModal
          key={selectedRecord.id}
          missingRecord={selectedRecord}
          isOpen={modalOpen}
          onOpenChange={setModalOpen}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
