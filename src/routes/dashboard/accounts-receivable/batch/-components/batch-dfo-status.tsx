import { useState } from 'react';
import CheckCircle2Icon from 'lucide-react/dist/esm/icons/check-circle-2';
import AlertCircleIcon from 'lucide-react/dist/esm/icons/alert-circle';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { TDataBatch } from '@/interfaces/data-batch';

interface BatchDFOStatusProps {
  batch: TDataBatch;
}

export const BatchDFOStatus = ({ batch }: BatchDFOStatusProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Not posted yet
  if (!batch.dfoIds && !batch.dfoPostingErrors) {
    return (
      <Alert variant='default'>
        <AlertCircleIcon />
        <AlertTitle>Not posted to D365FO yet</AlertTitle>
        <AlertDescription>
          This batch has not been posted to Dynamics 365 Finance & Operations.
        </AlertDescription>
      </Alert>
    );
  }

  // Posting failed
  if (batch.dfoPostingErrors && batch.dfoPostingErrors.length > 0) {
    return (
      <Alert variant='destructive'>
        <AlertCircleIcon />
        <AlertTitle>Posting Failed</AlertTitle>
        <AlertDescription>
          <div className='space-y-2'>
            <p>The batch failed to post to D365FO with the following errors:</p>
            <ul className='list-disc list-inside space-y-1'>
              {batch.dfoPostingErrors.map((error, idx) => (
                <li key={idx} className='text-sm'>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Posting succeeded
  if (batch.dfoIds && batch.dfoIds.length > 0) {
    return (
      <Alert variant='default' className='bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'>
        <CheckCircle2Icon className='text-emerald-600 dark:text-emerald-400' />
        <AlertTitle className='text-emerald-900 dark:text-emerald-100'>
          Successfully Posted to D365FO
        </AlertTitle>
        <AlertDescription className='text-emerald-800 dark:text-emerald-200'>
          <div className='space-y-2'>
            <p>{batch.dfoIds.length} BatchNumber(s) created in D365FO</p>
            <details
              open={isExpanded}
              onToggle={(e) => setIsExpanded(e.currentTarget.open)}
              className='cursor-pointer'
            >
              <summary className='flex items-center gap-2 font-medium hover:underline'>
                {isExpanded ? (
                  <>
                    <ChevronUp className='size-4' />
                    Hide BatchNumbers
                  </>
                ) : (
                  <>
                    <ChevronDown className='size-4' />
                    View BatchNumbers
                  </>
                )}
              </summary>
              <ul className='list-disc list-inside space-y-1 mt-2 ml-2'>
                {batch.dfoIds.map((id, idx) => (
                  <li key={idx} className='text-sm font-mono'>
                    BatchNumber: {id}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
