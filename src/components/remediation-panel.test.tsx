import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RemediationPanel } from '@/components/remediation-panel';

const mocks = vi.hoisted(() => ({
  reprocess: vi.fn(),
  invalidate: vi.fn(),
  records: [] as Array<Record<string, unknown>>,
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: mocks.records, isPending: false }),
}));

vi.mock('@/hooks/use-services', () => ({
  useServices: () => ({
    dataBatch: {
      queryKey: ['data-batch'],
      missingMasterDataQueryOptions: vi.fn(),
      reprocess: mocks.reprocess,
    },
    dataBatchError: { queryKey: ['data-batch-error'] },
  }),
}));

vi.mock('@/hooks/use-invalidate', () => ({
  useInvalidate: () => ({ invalidate: mocks.invalidate }),
}));

describe(RemediationPanel.name, () => {
  beforeEach(() => {
    mocks.reprocess.mockReset().mockResolvedValue(undefined);
    mocks.invalidate.mockReset();
    mocks.records = [
      {
        id: 'missing-1',
        batchId: 'batch-1',
        company: 'Saco',
        entryProcessorType: 1,
        type: 'customer',
        missingField: 'CustomerAccount',
        missingValue: 'C-100',
        creationStatus: 'created',
        reprocessStatus: 'failed',
        affectedCount: 2,
        readonlyFormFields: ['CustomerAccount'],
        reprocessAttempts: 1,
        reprocessErrorMessage: 'validation failed',
      },
    ];
  });

  // The per-record retry button was removed in f5ae3de (refactor reprocess logic).
  // The batch-level reprocess service takes only batchId, so this test covers the
  // current behavior: show the failure, offer no creation and no inline retry.
  it('shows the reprocess failure for a created record without offering creation or retry', () => {
    render(<RemediationPanel batchId='batch-1' />);

    expect(
      screen.getByText('Reprocessing failed: validation failed'),
    ).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: /create customer/i }),
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: /retry reprocessing/i }),
    ).toBeNull();
    expect(mocks.reprocess).not.toHaveBeenCalled();
  });
});
