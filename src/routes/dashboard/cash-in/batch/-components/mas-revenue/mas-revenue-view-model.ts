import type {
  MasRevenueReview,
  MasRevenueRowIssue,
} from '@/services/api/mas-revenue';

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

/**
 * The message to show for a failed request. API errors arrive as plain objects with a
 * message, not as Error instances, so both are read. The fallback is used only when
 * there is no message at all.
 */
export function messageOfError(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim() !== '') {
      return message;
    }
  }
  return fallback;
}
