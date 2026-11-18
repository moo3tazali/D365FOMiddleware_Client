import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type {
  YardInvoiceJob,
  YardInvoiceLine,
  YardInvoiceSummary,
} from '@/services/api/yard-invoice';

import { YardInvoiceReview } from './yard-invoice-review';

const summary = (
  overrides: Partial<YardInvoiceSummary> = {},
): YardInvoiceSummary => ({
  format: 'YARDS_SOURCE',
  formatLabel: 'Yards source workbook (per-sheet layouts)',
  fileName: 'Yards.xlsx',
  companyId: 'm-p',
  sheets: [
    {
      sourceSheet: 'Atlantic',
      layoutId: 'YARDS_LAYOUT_CUR_SAFE',
      contentRows: 96,
      acceptedRecords: 96,
      issueCount: 0,
    },
  ],
  recordCount: 96,
  distinctInvoiceCount: 96,
  blockedInvoiceCount: 0,
  issueCount: 0,
  aggregationIssueCount: 0,
  creditNoteInvoiceCount: 0,
  discrepancyCount: 0,
  lookupFailedCount: 0,
  currencyTotals: [
    {
      currencyCode: 'EGP',
      invoiceCount: 96,
      rawTotal: '131520.0001',
      roundedTotal: '131520.00',
      roundingChange: '-0.0001',
    },
  ],
  offsetAccountCounts: [{ status: 'OK', count: 96 }],
  issues: [],
  aggregationIssues: [],
  canSubmit: true,
  submitBlockedReason: null,
  payloadHash: 'abcdef1234567890',
  correlationId: 'c',
  ...overrides,
});

const line = (overrides: Partial<YardInvoiceLine> = {}): YardInvoiceLine => ({
  invoiceNumber: '000061184/YD',
  status: 'VALID',
  creditNote: false,
  sourceRefs: ['Atlantic!2'],
  paymentSerials: [],
  currencyCode: 'EGP',
  paymentType: 'Cash',
  paymentDate: '2026-07-01',
  safeBankAccount: 'AtlanticEG',
  paymentReference: '',
  rawTotal: '1370.0000',
  roundedTotal: '1370.00',
  roundingChange: '0.0000',
  roundingVariance: '0.0000',
  workbook: {
    customerAccounts: ['C-100'],
    dimensions: ['|2401|024'],
    financialTags: ['TAG-A'],
  },
  d365: {
    customerAccount: 'C-100',
    defaultDimensionDisplayValue: '|2401|024',
    financialTagDisplayValue: 'TAG-A',
    voucher: 'V-1',
    expectedOpenBalance: '2000.00',
  },
  offsetAccount: { status: 'OK', accountType: 'Petty cash', message: '' },
  errors: [],
  warnings: [],
  outcome: 'READY_TO_SUBMIT',
  ...overrides,
});

const job = (overrides: Partial<YardInvoiceJob> = {}): YardInvoiceJob => ({
  jobId: 'job-1234abcd',
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

function renderReview(
  overrides: Partial<Parameters<typeof YardInvoiceReview>[0]> = {},
) {
  const props = {
    job: job(),
    lines: [line()],
    linesTotal: 96,
    page: 1,
    pageSize: 50,
    onPage: vi.fn(),
    reviewConfirmed: false,
    onConfirmChange: vi.fn(),
    onSubmit: vi.fn(),
    submitAllowed: false,
    submitting: false,
    hasFile: true,
    ...overrides,
  };
  render(<YardInvoiceReview {...props} />);
  return props;
}

describe('YardInvoiceReview layout', () => {
  it('shows a green success banner when every invoice is ready', () => {
    renderReview({ submitAllowed: true });
    expect(screen.getByText('Entries processed successfully')).toBeTruthy();
  });

  it('shows the same Post to D365FO action as the other Cash In batches', () => {
    renderReview({ submitAllowed: true });
    expect(screen.getByRole('button', { name: 'Post to D365FO' })).toBeTruthy();
  });
});

describe('YardInvoiceReview', () => {
  it('shows the detected format explicitly, the sheets, totals and rounding change', () => {
    renderReview();
    expect(
      screen.getByText('Yards source workbook (per-sheet layouts)'),
    ).toBeTruthy();
    expect(screen.getByText('Atlantic')).toBeTruthy();
    expect(screen.getByText('131520.0001')).toBeTruthy();
    expect(screen.getByText('-0.0001')).toBeTruthy();
  });

  it('shows the workbook value and the D365 value side by side for a line', () => {
    renderReview({
      job: job({
        canSubmit: false,
        summary: summary({ canSubmit: false, discrepancyCount: 1 }),
      }),
      lines: [
        line({
          status: 'BLOCKED',
          workbook: {
            customerAccounts: ['C-999'],
            dimensions: ['|2401|024'],
            financialTags: ['TAG-A'],
          },
          errors: [
            'workbook customer account (C-999) differs from D365 (C-100); resolve the difference before submitting',
          ],
          outcome: 'BLOCKED',
        }),
      ],
    });
    expect(screen.getByText('workbook: C-999')).toBeTruthy();
    expect(screen.getByText('D365: C-100')).toBeTruthy();
    expect(screen.getByText(/differs from D365/)).toBeTruthy();
    expect(screen.getByText('Workbook vs D365 differences: 1')).toBeTruthy();
  });

  it('marks a credit-note line and lists record issues that block submission', () => {
    renderReview({
      job: job({
        canSubmit: false,
        summary: summary({
          canSubmit: false,
          creditNoteInvoiceCount: 1,
          issueCount: 1,
          issues: [
            {
              sourceSheet: 'yard.',
              sourceRow: 4028,
              column: 'Payment Rmrk',
              message: 'payment remark is 43 characters',
            },
          ],
          submitBlockedReason:
            'Fix the blocked invoices or file issues and upload again.',
        }),
      }),
      lines: [
        line({
          invoiceNumber: '000000356/YD-CN',
          creditNote: true,
          status: 'BLOCKED',
          outcome: 'BLOCKED',
        }),
      ],
    });
    expect(screen.getByText('credit note')).toBeTruthy();
    expect(screen.getByText(/yard\., row 4028, Payment Rmrk/)).toBeTruthy();
  });

  it('keeps submit disabled until the reviewer confirms, then calls submit once per click', () => {
    const onSubmit = vi.fn();
    renderReview({ submitAllowed: true, onSubmit });
    const submit = screen.getByRole('button', {
      name: 'Post to D365FO',
    }) as HTMLButtonElement;
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables submit and the confirmation when the server refuses the review', () => {
    renderReview({
      job: job({
        canSubmit: false,
        summary: summary({ canSubmit: false, blockedInvoiceCount: 1 }),
      }),
      submitAllowed: false,
    });
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);
    const submit = screen.getByRole('button', {
      name: 'Post to D365FO',
    }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
  });

  it('pages the invoice list through the callback', () => {
    const onPage = vi.fn();
    renderReview({ page: 2, linesTotal: 200, onPage });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPage).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPage).toHaveBeenCalledWith(1);
  });
});
