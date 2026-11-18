import { useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
} from '@/services/api/yard-invoice';

import { YardInvoiceJobPanel } from './yard-invoice-job-panel';
import { YardInvoiceReview, type YardUploadMode } from './yard-invoice-review';

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
 * Yard invoice upload flow. The workbook is reviewed in the background: the
 * page starts a job, polls until the review settles, then shows the summary and
 * a paged list of invoices. Submit is also a background job that the page polls.
 * The job id is kept in the URL so a refresh or reopen shows the persisted state.
 */
export function YardInvoiceWorkbench() {
  const [jobId, setJobId] = useState<string | undefined>(readJobIdFromUrl);
  const [file, setFile] = useState<File | null>(null);
  const [job, setJob] = useState<YardInvoiceJob | null>(null);
  const [lines, setLines] = useState<YardInvoiceLine[]>([]);
  const [linesTotal, setLinesTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  // Review only is the default. Posting is a separate, explicit choice.
  const [mode, setMode] = useState<YardUploadMode>('review');
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

  return (
    <div className='space-y-6'>
      <UploadStep busy={busy === 'review'} onSelect={handleReview} />

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
          mode={mode}
          onModeChange={setMode}
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
    </div>
  );
}

function UploadStep({
  busy,
  onSelect,
}: {
  busy: boolean;
  onSelect: (file: File) => void;
}) {
  const [picked, setPicked] = useState<File | null>(null);
  return (
    <div className='flex flex-col gap-3 rounded-xl border border-dashed p-5 sm:flex-row sm:items-center'>
      <input
        type='file'
        accept='.xlsx'
        aria-label='Yard invoice workbook (.xlsx)'
        disabled={busy}
        onChange={(event) => setPicked(event.target.files?.[0] ?? null)}
        className='text-sm'
      />
      <Button
        type='button'
        disabled={!picked || busy}
        onClick={() => picked && onSelect(picked)}
      >
        {busy ? 'Starting review…' : 'Review upload'}
      </Button>
    </div>
  );
}
