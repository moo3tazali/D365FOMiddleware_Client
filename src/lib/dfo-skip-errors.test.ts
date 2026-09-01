import { describe, expect, it } from 'vitest';

import {
  formatExcelLineList,
  summarizeDfoSkipErrors,
} from './dfo-skip-errors';

describe('summarizeDfoSkipErrors', () => {
  it('collapses UniqueId skip dumps into a count instead of listing every line', () => {
    const summary = summarizeDfoSkipErrors([
      'Upload skipped: UniqueId 488810 Excel line 4267, 4268, 4452: already marked',
      'Settlement skipped: UniqueId 475761 Excel line 841: remainder',
      'Journal header create failed',
    ]);

    expect(summary).toEqual({
      skipIssueCount: 2,
      uniqueIdCount: 2,
      otherErrors: ['Journal header create failed'],
      hasSkips: true,
    });
  });

  it('reads the compact backend summary without treating it as a fatal posting error', () => {
    const summary = summarizeDfoSkipErrors([
      'Skipped lines: 42 skipped UniqueId issue(s) across 18 UniqueId(s) and 186 Excel line(s) (20 upload, 22 settlement). Open View Errors or download the error Excel for UniqueId, Excel LINENUMBER, and reason.',
    ]);

    expect(summary.hasSkips).toBe(true);
    expect(summary.skipIssueCount).toBe(42);
    expect(summary.otherErrors).toEqual([]);
  });

  it('collapses the live batch dump that starts with UniqueId 488810', () => {
    const dump = [
      'Upload skipped: UniqueId 488810 Excel line 4267, 4268, 4452: Failed to post cash-out lines for header Mesco-000015603: This transaction has been marked for settlement by Vendor Payment Freight Mesco-000015603 in company m-p.',
      'Settlement skipped: UniqueId 510443 Excel line 841: Expected one open invoice transaction for vendor, found 2.',
      'Upload skipped: UniqueId 466596 Excel line 900: This transaction has been marked for settlement by Vendor Payment Freight Mesco-000015604 in company m-p.',
    ].join('\n');

    const summary = summarizeDfoSkipErrors([dump]);

    expect(summary).toEqual({
      skipIssueCount: 3,
      uniqueIdCount: 3,
      otherErrors: [],
      hasSkips: true,
    });
  });
});

describe('formatExcelLineList', () => {
  it('truncates long Excel line lists for the errors table', () => {
    expect(formatExcelLineList([841])).toBe('841');
    expect(
      formatExcelLineList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    ).toBe('1, 2, 3, 4, 5, 6, 7, 8 +2 more');
  });
});
