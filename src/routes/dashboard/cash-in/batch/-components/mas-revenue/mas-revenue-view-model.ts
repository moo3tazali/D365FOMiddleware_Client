import type {
  MasRevenueReview,
  MasRevenueRowIssue,
} from '@/services/api/mas-revenue';

const CURRENCY_PATTERN = /^[A-Z]{3}$/;

/** Normalizes a currency entry. Returns null when it is not a three-letter code. */
export function normalizeCurrencyInput(value: string): string | null {
  const code = value.trim().toUpperCase();
  return CURRENCY_PATTERN.test(code) ? code : null;
}

export interface CreateBatchGate {
  allowed: boolean;
  /** Every reason the batch cannot be created yet, shown to the user in order. */
  reasons: string[];
}

/**
 * Whether "Create batch" may be used. It mirrors the server checks so the user sees
 * the reason before a request is sent. The server still checks everything.
 */
export function createBatchGate(
  review: MasRevenueReview | null,
  currency: string,
): CreateBatchGate {
  const reasons: string[] = [];
  if (!review) {
    return { allowed: false, reasons: ['Upload and validate a file first.'] };
  }
  if (normalizeCurrencyInput(currency) === null) {
    reasons.push(
      'Choose the transaction currency (three letters, for example EGP).',
    );
  }
  if (review.batchId) {
    reasons.push(`This review already created batch ${review.batchId}.`);
  }
  if (!review.uploadValid) {
    reasons.push(
      'The file has row issues or no receipts. Correct the file and upload it again.',
    );
  }
  for (const blocker of review.blockers) {
    reasons.push(blocker);
  }
  return { allowed: reasons.length === 0 && review.canSubmit, reasons };
}

/** Client-generated key for one submit attempt. A repeated attempt reuses it. */
export function newIdempotencyKey(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `mas-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Quotes a CSV cell and neutralizes spreadsheet formulas. */
export function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * Error report for the review: one row per issue, with sheet, row, column, the value
 * as read from the file, and the correction message. A UTF-8 byte-order mark keeps
 * Arabic text readable when the file is opened in Excel.
 */
export function issuesToCsv(issues: MasRevenueRowIssue[]): string {
  const header = ['Sheet', 'Row', 'Column', 'Value', 'Problem'];
  const rows = issues.map((issue) =>
    [
      csvCell(issue.sourceSheet),
      csvCell(issue.sourceRow),
      csvCell(issue.column),
      csvCell(issue.originalValue),
      csvCell(issue.message),
    ].join(','),
  );
  const bom = String.fromCharCode(0xfeff);
  return `${bom}${[header.map((h) => csvCell(h)).join(','), ...rows].join('\r\n')}\r\n`;
}

/** Totals per currency as display rows. Money is text from the server, never a float sum. */
export function totalsRows(review: MasRevenueReview | null) {
  const totals = review?.summary?.totalsByCurrency ?? {};
  return Object.entries(totals).map(([currency, amounts]) => ({
    currency,
    value: amounts.value,
    vat: amounts.vat,
    total: amounts.total,
  }));
}
