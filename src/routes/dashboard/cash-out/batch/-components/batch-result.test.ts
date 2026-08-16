import { describe, expect, it } from 'vitest';

import { formatBatchResultCount } from './batch-result';

describe('formatBatchResultCount', () => {
  it('renders zero counts instead of the empty card placeholder', () => {
    expect(formatBatchResultCount(0)).toBe('0');
  });

  it('formats populated counts and keeps the placeholder for missing counts', () => {
    expect(formatBatchResultCount(2_944)).toBe('2,944');
    expect(formatBatchResultCount(undefined)).toBe('--');
  });
});
