import { describe, expect, it } from 'vitest';

import type {
  MasRevenueReview,
  MasRevenueRowIssue,
} from '@/services/api/mas-revenue';

import {
  csvCell,
  issuesToCsv,
  messageOfError,
  newIdempotencyKey,
  totalsRows,
} from './mas-revenue-view-model';

function review(overrides: Partial<MasRevenueReview> = {}): MasRevenueReview {
  return {
    reviewId: 'r1',
    company: 'mas',
    fileName: 'upload.xlsx',
    templateVersion: 1,
    status: 'PREVIEWED',
    canSubmit: true,
    uploadValid: true,
    reviewVersion: 1,
    payloadHash: 'a'.repeat(64),
    receiptCount: 1,
    summary: null,
    blockers: [],
    batchId: null,
    submittedAt: null,
    lastError: null,
    correlationId: 'c1',
    ...overrides,
  };
}

describe('issuesToCsv', () => {
  const issues: MasRevenueRowIssue[] = [
    {
      sourceSheet: 'Row Data',
      sourceRow: 4,
      column: 'Total',
      originalValue: '=1+1',
      message: 'total must equal value + VAT; a "quoted" detail',
    },
  ];

  it('starts with a byte-order mark so Excel reads Arabic text correctly', () => {
    expect(issuesToCsv(issues).charCodeAt(0)).toBe(0xfeff);
  });

  it('writes a header and one row per issue, with quotes escaped', () => {
    const lines = issuesToCsv(issues).slice(1).split('\r\n').filter(Boolean);
    expect(lines[0]).toBe('"Sheet","Row","Column","Value","Problem"');
    expect(lines[1]).toBe(
      '"Row Data","4","Total","\'=1+1","total must equal value + VAT; a ""quoted"" detail"',
    );
  });

  it('neutralizes a value that a spreadsheet would read as a formula', () => {
    expect(csvCell('=SUM(A1)')).toBe('"\'=SUM(A1)"');
    expect(csvCell('+1')).toBe('"\'+1"');
    expect(csvCell('-1')).toBe('"\'-1"');
    expect(csvCell('@x')).toBe('"\'@x"');
    expect(csvCell('plain')).toBe('"plain"');
  });
});

describe('newIdempotencyKey', () => {
  it('returns a distinct, non-empty key for each submit attempt', () => {
    const first = newIdempotencyKey();
    const second = newIdempotencyKey();
    expect(first.length).toBeGreaterThan(0);
    expect(first).not.toBe(second);
  });
});

describe('totalsRows', () => {
  it('returns the server totals as text, one row per currency', () => {
    const rows = totalsRows(
      review({
        summary: {
          sourceSheet: 'Row Data',
          headerRow: 1,
          scannedDataRows: 3,
          nonTransactionRows: { blank: 0, zeroPlaceholder: 0, cancelled: 0 },
          accounting: { transactionRowsRead: 3, accepted: 3, rejected: 0 },
          totalsByCurrency: {
            EGP: { value: '4800.00', vat: '672.00', total: '5472.00' },
          },
          journalGroups: [],
          issueCount: 0,
          issues: [],
        },
      }),
    );
    expect(rows).toEqual([
      { currency: 'EGP', value: '4800.00', vat: '672.00', total: '5472.00' },
    ]);
  });

  it('returns no rows when there is no summary', () => {
    expect(totalsRows(null)).toEqual([]);
  });
});

describe('messageOfError', () => {
  it('reads the message of an API error object, not only Error instances', () => {
    expect(
      messageOfError(
        { code: 409, message: 'Receipt(s) already submitted in another batch' },
        'fallback',
      ),
    ).toBe('Receipt(s) already submitted in another batch');
    expect(messageOfError(new Error('boom'), 'fallback')).toBe('boom');
  });

  it('falls back only when there is no message', () => {
    expect(messageOfError({}, 'fallback')).toBe('fallback');
    expect(messageOfError({ message: '  ' }, 'fallback')).toBe('fallback');
    expect(messageOfError(null, 'fallback')).toBe('fallback');
  });
});
