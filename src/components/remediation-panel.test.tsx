import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('retries reprocessing for the stored missing record without offering creation', async () => {
    render(<RemediationPanel batchId='batch-1' />);

    expect(
      screen.queryByRole('button', { name: /create customer/i }),
    ).toBeNull();

    fireEvent.click(
      screen.getByRole('button', { name: /retry reprocessing/i }),
    );

    await waitFor(() => {
      expect(mocks.reprocess).toHaveBeenCalledWith('batch-1', 'missing-1');
    });
  });
});
