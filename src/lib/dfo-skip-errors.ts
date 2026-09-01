const SKIP_DETAIL_PATTERN = /^(Upload|Settlement) skipped:/i;
const SKIP_SUMMARY_PATTERN = /^Skipped lines:\s+(\d+)/i;
const UNIQUE_ID_PATTERN = /UniqueId\s+([^:\s]+)/i;

export function isDfoSkipMessage(message: string): boolean {
  const text = message.trim();
  return SKIP_DETAIL_PATTERN.test(text) || SKIP_SUMMARY_PATTERN.test(text);
}

export interface DfoSkipErrorSummary {
  skipIssueCount: number;
  uniqueIdCount: number;
  otherErrors: string[];
  hasSkips: boolean;
}

export function summarizeDfoSkipErrors(
  errors: string[] | undefined | null,
): DfoSkipErrorSummary {
  const uniqueIds = new Set<string>();
  const otherErrors: string[] = [];
  let skipIssueCount = 0;

  for (const error of errors ?? []) {
    const text = String(error ?? '').trim();
    const summaryMatch = text.match(SKIP_SUMMARY_PATTERN);
    if (summaryMatch) {
      skipIssueCount += Number(summaryMatch[1]) || 1;
      continue;
    }
    if (SKIP_DETAIL_PATTERN.test(text)) {
      skipIssueCount += 1;
      const uniqueId = text.match(UNIQUE_ID_PATTERN)?.[1];
      if (uniqueId && uniqueId !== '?') uniqueIds.add(uniqueId);
      continue;
    }
    if (text) otherErrors.push(error);
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
