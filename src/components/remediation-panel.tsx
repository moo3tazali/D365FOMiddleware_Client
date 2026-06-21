import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServices } from '@/hooks/use-services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Wrench from 'lucide-react/dist/esm/icons/wrench';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import { CreateCustomerModal } from './create-customer-modal';
import type { TDataBatchMissingMasterData } from '@/interfaces/data-batch';

interface RemediationPanelProps {
  batchId: string;
}

export function RemediationPanel({ batchId }: RemediationPanelProps) {
  const { dataBatch } = useServices();

  const { data: missingRecords, isPending } = useQuery(
    dataBatch.missingMasterDataQueryOptions(batchId),
  );

  const [selectedRecord, setSelectedRecord] =
    useState<TDataBatchMissingMasterData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (isPending) {
    return (
      <div className='flex items-center gap-2 text-sm text-muted-foreground p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800/80 mb-6'>
        <Loader2 className='h-4 w-4 animate-spin text-primary' />
        <span>Loading remediation actions...</span>
      </div>
    );
  }

  const activeRecords = missingRecords || [];

  if (activeRecords.length === 0) {
    return null;
  }

  const handleResolveClick = (record: TDataBatchMissingMasterData) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  return (
    <div className='p-5 bg-amber-500/10 border border-amber-500/25 dark:bg-amber-950/20 dark:border-amber-950/50 rounded-xl mb-6 shadow-xs backdrop-blur-md'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/20 dark:border-amber-950/40'>
        <div className='flex items-center gap-3 text-left'>
          <div className='p-2 bg-amber-500/20 dark:bg-amber-950/45 rounded-lg text-amber-600 dark:text-amber-400'>
            <AlertCircle className='h-5 w-5 animate-pulse' />
          </div>
          <div>
            <h3 className='text-base font-bold tracking-tight text-amber-800 dark:text-amber-300'>
              Missing Master Data Detected
            </h3>
            <p className='text-xs text-amber-700/80 dark:text-amber-400/80'>
              Some records in this batch reference customer tax numbers that are
              not currently in the local cache. Create them inline to resolve
              the errors.
            </p>
          </div>
        </div>
      </div>

      <div className='mt-4 space-y-3'>
        {activeRecords.map((record) => {
          const isCreated = record.creationStatus === 'created';
          const isCreating = record.creationStatus === 'creating';
          const creationFailed = record.creationStatus === 'create_failed';
          const reprocessFailed = record.reprocessStatus === 'failed';
          const isReprocessing = record.reprocessStatus === 'processing';
          const isResolved = record.reprocessStatus === 'succeeded';

          return (
            <div
              key={record.id}
              className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-white/60 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/40 rounded-lg text-left'
            >
              <div className='space-y-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='text-sm font-bold text-zinc-800 dark:text-zinc-200'>
                    {record.type.toUpperCase()}:
                  </span>
                  <Badge
                    color='secondary'
                    className='font-mono text-xs px-2 py-0.5 select-all'
                  >
                    {record.missingValue}
                  </Badge>
                  <span className='text-xs text-zinc-500 dark:text-zinc-400'>
                    (Affects {record.affectedCount} raw rows)
                  </span>
                </div>
                {creationFailed && record.createErrorMessage && (
                  <p className='text-xs text-destructive font-medium'>
                    Creation failed: {record.createErrorMessage}
                  </p>
                )}
                {reprocessFailed && record.reprocessErrorMessage && (
                  <p className='text-xs text-destructive font-medium'>
                    Reprocessing failed: {record.reprocessErrorMessage}
                  </p>
                )}
              </div>

              <div className='flex items-center gap-3 shrink-0'>
                {isResolved ? (
                  <div className='flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
                    <CheckCircle2 className='h-4 w-4' />
                    <span>Resolved</span>
                  </div>
                ) : isCreating || isReprocessing ? (
                  <div className='flex items-center gap-1.5 text-xs font-semibold text-zinc-500'>
                    <Loader2 className='h-4 w-4 animate-spin text-primary' />
                    <span>
                      {isCreating
                        ? 'Creating in D365FO...'
                        : 'Reprocessing batch...'}
                    </span>
                  </div>
                ) : !isCreated ? (
                  <>
                    {creationFailed && (
                      <span className='text-xs font-bold text-destructive'>
                        Creation failed
                      </span>
                    )}
                    <Button
                      size='sm'
                      onClick={() => handleResolveClick(record)}
                      className='h-8 gap-1.5 text-xs font-semibold px-3 bg-primary hover:opacity-90 transition-opacity'
                    >
                      <Wrench className='h-3.5 w-3.5' />
                      <span>Create customer</span>
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {selectedRecord && (
        <CreateCustomerModal
          key={selectedRecord.id}
          missingRecord={selectedRecord}
          isOpen={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  );
}
