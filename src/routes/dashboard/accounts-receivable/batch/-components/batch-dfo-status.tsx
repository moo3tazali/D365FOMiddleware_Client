import { useState } from 'react';
import CheckCircle2Icon from 'lucide-react/dist/esm/icons/check-circle-2';
import AlertCircleIcon from 'lucide-react/dist/esm/icons/alert-circle';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getExpectedGroupCountLabel } from '@/constants/data-batch';
import type { TDataBatch } from '@/interfaces/data-batch';
import { useAuth } from '@/hooks/use-auth';

interface BatchDFOStatusProps {
  batch: TDataBatch;
}

export const BatchDFOStatus = ({ batch }: BatchDFOStatusProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expectedGroupCount =
    typeof batch.expectedGroupCount === 'number'
      ? batch.expectedGroupCount
      : undefined;
  const dfoIds = batch.dfoIds ?? [];
  const dfoPostingErrors = batch.dfoPostingErrors ?? [];
  const hasDfoIds = dfoIds.length > 0;
  const hasDfoPostingErrors = dfoPostingErrors.length > 0;
  const groupLabels = getDfoGroupLabels(batch.entryProcessorType);
  const isAdmin = useAuth((state) => state.user?.role === 'ADMIN');

  // Not posted yet
  if (!hasDfoIds && !hasDfoPostingErrors) {
    return (
      <Alert variant='default'>
        <AlertCircleIcon />
        <AlertTitle>Not posted to D365FO yet</AlertTitle>
        <AlertDescription>
          {expectedGroupCount === undefined ? (
            'This batch has not been posted to Dynamics 365 Finance & Operations.'
          ) : (
            <div className='space-y-1'>
              <p>
                This batch has not been posted to Dynamics 365 Finance &
                Operations.
              </p>
              <p>
                {expectedGroupCount} {groupLabels.countLabel} will be created in
                D365FO
              </p>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Posting failed
  if (hasDfoPostingErrors) {
    return (
      <Alert variant='destructive'>
        <AlertCircleIcon />
        <AlertTitle>Posting Failed</AlertTitle>
        <AlertDescription>
          <div className='space-y-2'>
            <p>The batch failed to post to D365FO with the following errors:</p>
            <ul className='list-disc list-inside space-y-1'>
              {dfoPostingErrors.map((error, idx) => (
                <li key={idx} className='text-sm'>
                  {error}
                </li>
              ))}
            </ul>
            {isAdmin && <TraceLink batchId={batch.id} />}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Posting succeeded
  if (hasDfoIds) {
    return (
      <Alert
        variant='default'
        className='bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
      >
        <CheckCircle2Icon className='text-emerald-600 dark:text-emerald-400' />
        <AlertTitle className='text-emerald-900 dark:text-emerald-100'>
          Successfully Posted to D365FO
        </AlertTitle>
        <AlertDescription className='text-emerald-800 dark:text-emerald-200'>
          <div className='space-y-2'>
            <p>
              {dfoIds.length} {groupLabels.countLabel} created in D365FO
            </p>
            <details
              open={isExpanded}
              onToggle={(e) => setIsExpanded(e.currentTarget.open)}
              className='cursor-pointer'
            >
              <summary className='flex items-center gap-2 font-medium hover:underline'>
                {isExpanded ? (
                  <>
                    <ChevronUp className='size-4' />
                    Hide {groupLabels.detailsLabel}
                  </>
                ) : (
                  <>
                    <ChevronDown className='size-4' />
                    View {groupLabels.detailsLabel}
                  </>
                )}
              </summary>
              <ul className='list-disc list-inside space-y-1 mt-2 ml-2'>
                {dfoIds.map((id, idx) => (
                  <li key={idx} className='text-sm font-mono'>
                    {groupLabels.itemLabel}: {id}
                  </li>
                ))}
              </ul>
            </details>
            {isAdmin && <TraceLink batchId={batch.id} />}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

const TraceLink = ({ batchId }: { batchId: string }) => (
  <a
    className='inline-block text-sm underline underline-offset-4'
    href={`/dashboard/observability?batchId=${encodeURIComponent(batchId)}`}
  >
    View processing trace
  </a>
);

const getDfoGroupLabels = (
  entryProcessorType: TDataBatch['entryProcessorType'],
) => {
  if (getExpectedGroupCountLabel(entryProcessorType) === 'invoice(s)') {
    return {
      countLabel: 'invoice(s)',
      detailsLabel: 'Invoices',
      itemLabel: 'Invoice',
    };
  }

  return {
    countLabel: 'BatchNumber(s)',
    detailsLabel: 'BatchNumbers',
    itemLabel: 'BatchNumber',
  };
};
