import { describe, expect, it } from 'vitest';

import { describeValidationField } from './validation-errors-modal';

describe('describeValidationField', () => {
  it('explains a missing vendor group in business terms', () => {
    expect(describeValidationField('customLineApiBody.VendorGroup')).toBe(
      'Vendor group is missing for this vendor. Synchronize the vendor master data in D365FO or assign a VendorGroup, then reprocess the batch.',
    );
  });

  it('preserves unrelated validation fields', () => {
    expect(describeValidationField('customLineApiBody.currency')).toBe(
      'customLineApiBody.currency',
    );
  });
});
