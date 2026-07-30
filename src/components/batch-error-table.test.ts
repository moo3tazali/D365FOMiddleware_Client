import { describe, expect, it } from 'vitest';

import type { TDataBatchError } from '@/interfaces/data-batch-error';
import { groupErrorsByMessage } from './batch-error-table';

describe('groupErrorsByMessage', () => {
  it('keeps the Excel line and UniqueId on the dedicated error page', () => {
    const items = [
      {
        id: 'error-1',
        batchId: 'batch-1',
        sourceRecordIds: ['Line 3 (UniqueId 466596)'],
        errorMessages: [],
        enhancedRecordIds: ['3'],
        accountDimensionsModel: {},
        enhancedData: {
          errors: [
            {
              property: 'Account - SubVendorDimensions',
              message: 'Dimension value SL-000007 was not found.',
            },
          ],
        },
      },
    ] as unknown as TDataBatchError[];

    expect(groupErrorsByMessage(items)).toEqual([
      {
        property: 'Account - SubVendorDimensions',
        message: 'Dimension value SL-000007 was not found.',
        sourceRecordIds: ['Line 3 (UniqueId 466596)'],
      },
    ]);
  });
});
