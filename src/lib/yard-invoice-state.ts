import type {
  YardInvoiceJob,
  YardInvoiceJobStatus,
  YardInvoiceSummary,
} from '@/services/api/yard-invoice';

export type YardInvoiceTone = 'success' | 'error' | 'pending' | 'warning';

const TERMINAL_BATCH_STATUSES = new Set(['Posted', 'Canceled']);

/**
 * Submit is offered only when the server said the review can post, the reviewer
 * confirmed it, the workbook is attached for the server re-review, and the job is
 * reviewed but not yet submitted (or its queueing failed). The server enforces all
 * of this again; the client gate prevents accidental double submits.
 */
export function canSubmitReview(input: {
  job: YardInvoiceJob | null;
  reviewConfirmed: boolean;
  hasFile: boolean;
  submitting: boolean;
}): boolean {
  const job = input.job;
  if (!job || !job.canSubmit) return false;
  if (job.status !== 'PREVIEWED' && job.status !== 'SUBMIT_FAILED')
    return false;
  if (!input.reviewConfirmed || !input.hasFile || input.submitting)
    return false;
  return true;
}

/** Keep polling while review or posting is still moving. */
export function isJobInFlight(job: YardInvoiceJob | null): boolean {
  if (!job) return false;
  if (
    job.status === 'REVIEWING' ||
    job.status === 'SUBMITTING' ||
    job.status === 'BATCH_CREATED'
  ) {
    return true;
  }
  if (job.status === 'QUEUED') {
    return !TERMINAL_BATCH_STATUSES.has(job.batchStatus ?? '');
  }
  return false;
}

export function jobStatusMessage(status: YardInvoiceJobStatus): string {
  switch (status) {
    case 'REVIEWING':
      return 'Reviewing the workbook. This can take several minutes for large files.';
    case 'REVIEW_FAILED':
      return 'The workbook could not be reviewed. Correct it and upload again.';
    case 'REVIEW_INTERRUPTED':
      return 'The review was interrupted. Upload the workbook again.';
    case 'PREVIEWED':
      return 'Reviewed. Not submitted yet.';
    case 'SUBMITTING':
      return 'Submitting. Please wait.';
    case 'BATCH_CREATED':
      return 'Batch created. Queueing for posting.';
    case 'QUEUED':
      return 'Queued for posting to D365 Finance.';
    case 'SUBMIT_FAILED':
      return 'Queueing failed. Submit again to retry the same batch.';
    case 'RECONCILE_REQUIRED':
      return 'Submission was interrupted. Ask an administrator to reconcile before retrying.';
    default:
      return 'Unknown status.';
  }
}

/** Whether a line outcome is final (no further change expected from this job). */
export function isFinalOutcome(outcome: string): boolean {
  return outcome === 'POSTED' || outcome === 'FAILED' || outcome === 'BLOCKED';
}

export function outcomeTone(outcome: string): YardInvoiceTone {
  switch (outcome) {
    case 'POSTED':
      return 'success';
    case 'FAILED':
    case 'NOT_POSTED_RETRY':
    case 'BLOCKED':
      return 'error';
    case 'READY_TO_SUBMIT':
      return 'warning';
    default:
      return 'pending';
  }
}

export function outcomeLabel(outcome: string): string {
  const labels: Record<string, string> = {
    READY_TO_SUBMIT: 'Ready to submit',
    BLOCKED: 'Blocked',
    SUBMITTING: 'Submitting',
    QUEUED: 'Queued',
    PROCESSING: 'Processing',
    POSTING: 'Posting',
    POSTED: 'Posted to journal (not settled)',
    FAILED: 'Failed',
    NOT_POSTED_RETRY: 'Not posted; retry allowed',
    NOT_REVIEWED: 'Not reviewed',
  };
  return labels[outcome] ?? outcome;
}

/** Count of items that block submission in a review summary. */
export function summaryBlockingCount(summary: YardInvoiceSummary): number {
  return (
    summary.blockedInvoiceCount +
    summary.issueCount +
    summary.aggregationIssueCount
  );
}

export function formatLabelFor(summary: YardInvoiceSummary): string {
  return summary.formatLabel;
}

/** Readable message from an API error without exposing internals. */
export function extractApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const data = (error as { response?: { data?: unknown } } | null)?.response
    ?.data;
  if (data && typeof data === 'object') {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
    if (Array.isArray(message) && message.length > 0)
      return message.map(String).join('; ');
    const errors = (data as { errors?: unknown }).errors;
    if (Array.isArray(errors) && errors.length > 0)
      return errors.map(String).slice(0, 3).join('; ');
  }
  if (
    error instanceof Error &&
    error.message &&
    !/status code/i.test(error.message)
  ) {
    return error.message;
  }
  return fallback;
}
