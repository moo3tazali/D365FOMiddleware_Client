import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { jobStatusMessage } from '@/lib/yard-invoice-state';
import type { YardInvoiceJob } from '@/services/api/yard-invoice';

/**
 * Job status for an upload: the review or submit state, the batch, the posting
 * queue reference and the last error. Per-invoice outcomes are shown in the
 * invoice list. Until the D365 line readback exists, an outcome is the batch
 * outcome, not a confirmed journal line.
 */
export function YardInvoiceJobPanel({ job }: { job: YardInvoiceJob }) {
  const reconcile =
    job.status === 'RECONCILE_REQUIRED' || job.status === 'SUBMITTING';
  return (
    <section className='space-y-4'>
      <div className='space-y-1'>
        <h2 className='text-base font-semibold'>Upload job</h2>
        <p className='text-sm'>{jobStatusMessage(job.status)}</p>
        <p className='text-xs text-muted-foreground'>
          Job {job.jobId.slice(0, 8)}
          {job.batchId ? ` · batch ${job.batchId}` : ''}
          {job.batchStatus ? ` · batch status ${job.batchStatus}` : ''}
          {job.batchErrorCount > 0
            ? ` · ${job.batchErrorCount} batch error(s)`
            : ''}
        </p>
      </div>

      {reconcile && (
        <Alert>
          <AlertDescription>
            Do not resubmit. Ask an administrator to confirm whether a batch was
            created for this job before retrying.
          </AlertDescription>
        </Alert>
      )}

      {job.lastError && (
        <Alert variant='destructive'>
          <AlertTitle>Last error</AlertTitle>
          <AlertDescription>{job.lastError}</AlertDescription>
        </Alert>
      )}

      <p className='text-xs text-muted-foreground'>
        Settlement:{' '}
        {job.settlement === 'NOT_SETTLED_UNMARKED'
          ? 'not settled (unmarked receipt)'
          : job.settlement}
      </p>
    </section>
  );
}
