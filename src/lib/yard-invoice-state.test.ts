import { describe, expect, it } from 'vitest';

import type {
  YardInvoiceJob,
  YardInvoiceSummary,
} from '@/services/api/yard-invoice';

import {
  canSubmitReview,
  extractApiErrorMessage,
  isFinalOutcome,
  isJobInFlight,
  outcomeLabel,
  outcomeTone,
  summaryBlockingCount,
} from './yard-invoice-state';

const summary = (
  overrides: Partial<YardInvoiceSummary> = {},
): YardInvoiceSummary => ({
  format: 'YARDS_SOURCE',
  formatLabel: 'Yards source workbook',
  fileName: 'Yards.xlsx',
  companyId: 'm-p',
  sheets: [],
  recordCount: 3,
  distinctInvoiceCount: 3,
  blockedInvoiceCount: 0,
  issueCount: 0,
  aggregationIssueCount: 0,
  creditNoteInvoiceCount: 0,
  discrepancyCount: 0,
  lookupFailedCount: 0,
  currencyTotals: [],
  offsetAccountCounts: [],
  issues: [],
  aggregationIssues: [],
  canSubmit: true,
  submitBlockedReason: null,
  payloadHash: 'h',
  correlationId: 'c',
  ...overrides,
});

const job = (overrides: Partial<YardInvoiceJob> = {}): YardInvoiceJob => ({
  jobId: 'job-1',
  company: 'm-p',
  fileName: 'Yards.xlsx',
  status: 'PREVIEWED',
  format: 'YARDS_SOURCE',
  payloadHash: 'h',
  canSubmit: true,
  summary: summary(),
  batchId: null,
  batchStatus: null,
  batchErrorCount: 0,
  postingJobId: null,
  submissionStatus: null,
  settlement: 'NOT_SETTLED_UNMARKED',
  lastError: null,
  correlationId: 'c',
  ...overrides,
});

describe('canSubmitReview', () => {
  const base = {
    job: job(),
    reviewConfirmed: true,
    hasFile: true,
    submitting: false,
  };

  it('allows submit only after confirmation, with the workbook attached and a submittable review', () => {
    expect(canSubmitReview(base)).toBe(true);
    expect(canSubmitReview({ ...base, reviewConfirmed: false })).toBe(false);
    expect(canSubmitReview({ ...base, hasFile: false })).toBe(false);
  });

  it('never allows submit when the server said the review cannot post', () => {
    expect(canSubmitReview({ ...base, job: job({ canSubmit: false }) })).toBe(
      false,
    );
    expect(canSubmitReview({ ...base, job: null })).toBe(false);
  });

  it('blocks a second submit while one is in flight or after the job was submitted', () => {
    expect(canSubmitReview({ ...base, submitting: true })).toBe(false);
    expect(
      canSubmitReview({ ...base, job: job({ status: 'SUBMITTING' }) }),
    ).toBe(false);
    expect(canSubmitReview({ ...base, job: job({ status: 'QUEUED' }) })).toBe(
      false,
    );
  });

  it('allows a reviewed-but-unsubmitted job, and a job whose queueing failed, to be submitted', () => {
    expect(
      canSubmitReview({ ...base, job: job({ status: 'SUBMIT_FAILED' }) }),
    ).toBe(true);
  });
});

describe('isJobInFlight', () => {
  it('polls while reviewing or submitting, and while a queued batch has not finished', () => {
    expect(isJobInFlight(job({ status: 'REVIEWING' }))).toBe(true);
    expect(isJobInFlight(job({ status: 'SUBMITTING' }))).toBe(true);
    expect(isJobInFlight(job({ status: 'BATCH_CREATED' }))).toBe(true);
    expect(
      isJobInFlight(job({ status: 'QUEUED', batchStatus: 'PendingPosting' })),
    ).toBe(true);
  });

  it('stops polling once the review settled or the batch is posted or cancelled', () => {
    expect(isJobInFlight(job({ status: 'PREVIEWED' }))).toBe(false);
    expect(isJobInFlight(job({ status: 'REVIEW_FAILED' }))).toBe(false);
    expect(
      isJobInFlight(job({ status: 'QUEUED', batchStatus: 'Posted' })),
    ).toBe(false);
    expect(
      isJobInFlight(job({ status: 'QUEUED', batchStatus: 'Canceled' })),
    ).toBe(false);
    expect(isJobInFlight(null)).toBe(false);
  });
});

describe('outcomes', () => {
  it('distinguishes posted, blocked, failed and pending outcomes', () => {
    expect(outcomeTone('POSTED')).toBe('success');
    expect(outcomeTone('BLOCKED')).toBe('error');
    expect(outcomeTone('FAILED')).toBe('error');
    expect(outcomeTone('QUEUED')).toBe('pending');
    expect(outcomeLabel('POSTED')).toBe('Posted to journal (not settled)');
    expect(isFinalOutcome('BLOCKED')).toBe(true);
    expect(isFinalOutcome('QUEUED')).toBe(false);
  });
});

describe('summaryBlockingCount', () => {
  it('counts blocked invoices and record-level and aggregation issues', () => {
    expect(
      summaryBlockingCount(
        summary({
          blockedInvoiceCount: 2,
          issueCount: 3,
          aggregationIssueCount: 1,
        }),
      ),
    ).toBe(6);
    expect(summaryBlockingCount(summary())).toBe(0);
  });
});

describe('extractApiErrorMessage', () => {
  it('prefers the server message and never shows raw HTTP status text', () => {
    const serverError = {
      response: { data: { message: 'Upload is not valid for posting.' } },
    };
    expect(extractApiErrorMessage(serverError, 'fallback')).toBe(
      'Upload is not valid for posting.',
    );
    expect(
      extractApiErrorMessage(
        { response: { data: { errors: ['a', 'b'] } } },
        'fallback',
      ),
    ).toBe('a; b');
    expect(
      extractApiErrorMessage(
        new Error('Request failed with status code 500'),
        'fallback',
      ),
    ).toBe('fallback');
    expect(extractApiErrorMessage(new Error('Network down'), 'fallback')).toBe(
      'Network down',
    );
  });
});
