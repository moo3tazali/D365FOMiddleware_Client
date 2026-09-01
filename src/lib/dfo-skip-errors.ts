const SKIP_DETAIL_PATTERN =
  /(?:\[Job processing\]\s*-\s*)?(?:Upload|Settlement)\s+skipped:/i;
const SKIP_SUMMARY_PATTERN = /(?:\[Job processing\]\s*-\s*)?Skipped lines:\s+(\d+)/i;
const UNIQUE_ID_PATTERN = /UniqueId\s+([^:\s]+)/i;
const SKIP_SPLIT_PATTERN = /(?=(?:\[Job processing\]\s*-\s*)?(?:Upload|Settlement)\s+skipped:)/i;

export function isDfoSkipMessage(message: string): boolean {
  return classifySkipMessage(String(message ?? '').trim()) !== null;
}

export interface DfoSkipErrorSummary {
  skipIssueCount: number;
  uniqueIdCount: number;
  otherErrors: string[];
  hasSkips: boolean;
}

export function summarizeDfoSkipErrors(
  errors: string[] | string | undefined | null,
): DfoSkipErrorSummary {
  const uniqueIds = new Set<string>();
  const otherErrors: string[] = [];
  let skipIssueCount = 0;

  for (const error of expandDfoPostingErrors(errors)) {
    const classified = classifySkipMessage(error);
    if (classified === 'summary') {
      const count = Number(error.match(SKIP_SUMMARY_PATTERN)?.[1]);
      skipIssueCount += Number.isFinite(count) && count > 0 ? count : 1;
      continue;
    }
    if (classified === 'detail') {
      skipIssueCount += 1;
      const uniqueId = error.match(UNIQUE_ID_PATTERN)?.[1];
      if (uniqueId && uniqueId !== '?') uniqueIds.add(uniqueId);
      continue;
    }
    otherErrors.push(error);
  }

  return {
    skipIssueCount,
    uniqueIdCount: uniqueIds.size,
    otherErrors,
    hasSkips: skipIssueCount > 0,
  };
}

export function formatExcelLineList(lines: number[]): string {
  if (lines.length === 0) return '';
  const sorted = [...new Set(lines)].sort((left, right) => left - right);
  if (sorted.length <= 8) return sorted.join(', ');
  return `${sorted.slice(0, 8).join(', ')} +${sorted.length - 8} more`;
}

function expandDfoPostingErrors(
  errors: string[] | string | undefined | null,
): string[] {
  if (!errors) return [];
  const items = typeof errors === 'string' ? [errors] : [...errors];
  return items.flatMap((item) => {
    const text = String(item ?? '').trim();
    if (!text) return [];
    const parts = text
      .split(SKIP_SPLIT_PATTERN)
      .map((part) => part.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts : [text];
  });
}

function classifySkipMessage(text: string): 'summary' | 'detail' | null {
  if (!text) return null;
  if (SKIP_SUMMARY_PATTERN.test(text)) return 'summary';
  if (SKIP_DETAIL_PATTERN.test(text)) return 'detail';
  if (
    UNIQUE_ID_PATTERN.test(text) &&
    /Excel line/i.test(text) &&
    /(marked for settlement|Failed to post cash-out lines)/i.test(text)
  ) {
    return 'detail';
  }
  return null;
}
