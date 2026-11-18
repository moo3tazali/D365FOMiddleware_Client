import { useEffect, useState } from 'react';
import Paperclip from 'lucide-react/dist/esm/icons/paperclip';
import SlidersHorizontal from 'lucide-react/dist/esm/icons/sliders-horizontal';
import UploadCloud from 'lucide-react/dist/esm/icons/upload-cloud';
import CloudAlert from 'lucide-react/dist/esm/icons/cloud-alert';
import Upload from 'lucide-react/dist/esm/icons/upload';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from '@/components/ui/file-upload';
import { CloudCheck } from '@/assets/icons/cloud-check';
import { StatCard } from '../../batch/-components/batch-result';
import { DropZoneContent } from '../../batch/-components/batch-form';
import {
  canSubmitReview,
  extractApiErrorMessage,
  isJobInFlight,
} from '@/lib/yard-invoice-state';
import {
  YARD_INVOICE_COMPANY,
  yardInvoiceApi,
  type YardInvoiceJob,
  type YardInvoiceLine,
  type YardInvoiceSummary,
} from '@/services/api/yard-invoice';

import { YardInvoiceJobPanel } from './yard-invoice-job-panel';
import { YardInvoiceReview } from './yard-invoice-review';

const POLL_INTERVAL_MS = 3000;
const PAGE_SIZE = 50;

function readJobIdFromUrl(): string | undefined {
  const value = new URLSearchParams(window.location.search).get('jobId');
  return value?.trim() || undefined;
}

function writeJobIdToUrl(id: string | undefined): void {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set('jobId', id);
  else url.searchParams.delete('jobId');
  window.history.replaceState(window.history.state, '', url.toString());
}

/**
 * Yard Document flow inside Cash In > New Batch. It uses the same upload area,
 * result cards and bottom action bar as the other Cash In document types. The
 * workbook is reviewed in the background; the page polls the job until the
 * review settles. Posting is a separate background job that the page polls too.
 * The job id is kept in the URL so a refresh or reopen shows the persisted state.
 */
export function YardInvoiceWorkbench() {
  const [jobId, setJobId] = useState<string | undefined>(readJobIdFromUrl);
  const [picked, setPicked] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [job, setJob] = useState<YardInvoiceJob | null>(null);
  const [lines, setLines] = useState<YardInvoiceLine[]>([]);
  const [linesTotal, setLinesTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [busy, setBusy] = useState<'review' | 'submit' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const enabled = import.meta.env.VITE_YARD_INVOICE_UPLOAD_ENABLED === 'true';

  // Load the persisted job when the URL carries one.
  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    yardInvoiceApi
      .getJob(jobId)
      .then((loaded) => {
        if (!cancelled) setJob(loaded);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(
            extractApiErrorMessage(err, 'Could not load the upload job.'),
          );
      });
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  // Poll while the review or the posting is still moving.
  useEffect(() => {
    if (!jobId || !isJobInFlight(job)) return;
    const timer = window.setInterval(() => {
      yardInvoiceApi
        .getJob(jobId)
        .then(setJob)
        .catch(() => undefined);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [jobId, job]);

  // Load the invoice page once the job has a reviewed summary, and when the page changes.
  const reviewed = job !== null && job.summary !== null;
  useEffect(() => {
    if (!jobId || !reviewed) return;
    let cancelled = false;
    yardInvoiceApi
      .getLines(jobId, page, PAGE_SIZE)
      .then((result) => {
        if (cancelled) return;
        setLines(result.items);
        setLinesTotal(result.total);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(
            extractApiErrorMessage(err, 'Could not load the invoice list.'),
          );
      });
    return () => {
      cancelled = true;
    };
    // Re-load when the job is re-reviewed or its outcome may have changed.
  }, [jobId, reviewed, page, job?.status, job?.batchStatus]);

  const selectJob = (id: string | undefined) => {
    setJobId(id);
    writeJobIdToUrl(id);
  };

  const handleReview = async (selected: File) => {
    setBusy('review');
    setError(null);
    try {
      const started = await yardInvoiceApi.startReview(
        selected,
        YARD_INVOICE_COMPANY,
      );
      setFile(selected);
      setJob(started);
      setLines([]);
      setLinesTotal(0);
      setPage(1);
      setReviewConfirmed(false);
      selectJob(started.jobId);
    } catch (err) {
      setError(
        extractApiErrorMessage(err, 'The workbook could not be reviewed.'),
      );
    } finally {
      setBusy(null);
    }
  };

  const handleSubmit = async () => {
    if (!job || !file) return;
    setBusy('submit');
    setError(null);
    try {
      setJob(
        await yardInvoiceApi.submit(job.jobId, file, YARD_INVOICE_COMPANY),
      );
    } catch (err) {
      setError(
        extractApiErrorMessage(
          err,
          'Submission failed. Review the upload again.',
        ),
      );
      await yardInvoiceApi
        .getJob(job.jobId)
        .then(setJob)
        .catch(() => undefined);
    } finally {
      setBusy(null);
    }
  };

  if (!enabled) {
    return (
      <Alert>
        <AlertDescription>
          Yard invoice upload is not enabled in this environment.
        </AlertDescription>
      </Alert>
    );
  }

  const submitAllowed = canSubmitReview({
    job,
    reviewConfirmed,
    hasFile: file !== null,
    submitting: busy === 'submit',
  });

  const reviewingNow = busy === 'review';
  // The upload bar shows until the picked file is the one already reviewed.
  const pickedIsReviewed = file !== null && picked === file;
  const showUploadBar = !(job?.summary && pickedIsReviewed);

  return (
    <div className='space-y-5'>
      <div className='space-y-3'>
        <label className='text-sm font-medium'>Upload New Batch</label>
        <FileUploader
          value={picked ? [picked] : null}
          onValueChange={(files) => setPicked(files?.[0] ?? null)}
          dropzoneOptions={{
            accept: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                ['.xlsx'],
            },
            multiple: false,
            maxFiles: 1,
            maxSize: 1024 * 1024 * 250, // 250MB
          }}
          className='relative bg-background rounded-xl'
          disabled={reviewingNow}
        >
          <FileInput id='yardDataFile'>
            <DropZoneContent isDisabled={reviewingNow} />
          </FileInput>
          <FileUploaderContent>
            {picked && (
              <FileUploaderItem index={0}>
                <div className='flex items-center gap-2'>
                  <div className='flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10'>
                    <Paperclip className='size-3.5 text-primary' />
                  </div>
                  <span className='block max-w-xs truncate text-sm font-medium sm:max-w-full'>
                    {picked.name}
                  </span>
                </div>
              </FileUploaderItem>
            )}
          </FileUploaderContent>
        </FileUploader>
      </div>

      <YardResultCards summary={job?.summary ?? null} />

      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {job && job.summary && (
        <YardInvoiceReview
          job={job}
          lines={lines}
          linesTotal={linesTotal}
          page={page}
          pageSize={PAGE_SIZE}
          onPage={setPage}
          reviewConfirmed={reviewConfirmed}
          onConfirmChange={setReviewConfirmed}
          onSubmit={handleSubmit}
          submitAllowed={submitAllowed}
          submitting={busy === 'submit'}
          hasFile={file !== null}
        />
      )}

      {job && !job.summary && <YardInvoiceJobPanel job={job} />}

      {job && job.summary && job.status !== 'PREVIEWED' && (
        <YardInvoiceJobPanel job={job} />
      )}

      {!job && jobId && (
        <Alert>
          <AlertDescription>Loading the upload job…</AlertDescription>
        </Alert>
      )}

      {showUploadBar && (
        <div className='pt-4 border-t border-border'>
          <div className='flex justify-end'>
            <Button
              size='lg'
              className='w-full sm:max-w-xs'
              disabled={!picked || reviewingNow}
              onClick={() => picked && handleReview(picked)}
            >
              <Upload className='size-5' />
              {reviewingNow ? 'Reviewing…' : 'Upload'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** The same four result cards as Cash In batches, filled from the Yard review. */
function YardResultCards({ summary }: { summary: YardInvoiceSummary | null }) {
  const value = (n: number | undefined) =>
    n === undefined ? '--' : n.toLocaleString('en-US');
  const invoices = summary?.distinctInvoiceCount;
  const blocked = summary?.blockedInvoiceCount;
  const ready =
    invoices !== undefined && blocked !== undefined
      ? invoices - blocked
      : undefined;

  return (
    <div className='flex-1 space-y-5'>
      <h3>Batch Results</h3>
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        <StatCard
          color='sky'
          label='Total Uploaded'
          total={value(summary?.recordCount)}
          icon={
            <UploadCloud className='size-5 text-sky-500 dark:text-sky-400' />
          }
        />
        <StatCard
          color='indigo'
          label='Total Formatted'
          total={value(invoices)}
          icon={
            <SlidersHorizontal className='size-5 text-indigo-500 dark:text-indigo-400' />
          }
        />
        <StatCard
          color='emerald'
          label='Success Count'
          total={value(ready)}
          icon={
            <CloudCheck className='size-5 text-emerald-500 dark:text-emerald-400' />
          }
        />
        <StatCard
          color='red'
          label='Error Count'
          total={value(blocked)}
          icon={
            <CloudAlert className='size-5 text-red-500 dark:text-red-400' />
          }
        />
      </div>
    </div>
  );
}
