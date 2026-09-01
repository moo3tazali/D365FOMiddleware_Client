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

  it('shows skipped UniqueIds with Excel lines instead of the raw posting dump', () => {
    const items = [
      {
        id: 'skip-1',
        batchId: 'batch-1',
        sourceRecordIds: ['488810'],
        errorMessages: [
          'Upload skipped: UniqueId 488810 186 Excel lines (4267–4452): already marked',
        ],
        enhancedRecordIds: ['1'],
        accountDimensionsModel: {},
        enhancedData: {
          kind: 'custody-settlement-skip',
          uniqueId: '488810',
          excelLineNumbers: [4267, 4268, 4452],
          phase: 'post',
          error: 'This transaction has been marked for settlement.',
        },
      },
    ] as unknown as TDataBatchError[];

    expect(groupErrorsByMessage(items)).toEqual([
      {
        property: 'Upload skipped',
        message: 'This transaction has been marked for settlement.',
        sourceRecordIds: ['488810'],
        excelLineNumbers: [4267, 4268, 4452],
      },
    ]);
  });
});
