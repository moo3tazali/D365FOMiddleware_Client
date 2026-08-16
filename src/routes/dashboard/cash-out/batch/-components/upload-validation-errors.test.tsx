import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { ErrorRes } from '@/interfaces/api-res';
import {
  getUploadValidationItems,
  UploadValidationErrors,
} from './upload-validation-errors';

describe('getUploadValidationItems', () => {
  it('flattens grouped Cash Out line and UniqueId errors', () => {
    const error: ErrorRes = {
      code: 400,
      message:
        'Cash Out pre-format validation failed. No journal request was generated.',
      validationErrors: {
        'Line 17 (UniqueId 2065) Account': [
          'Main account 999999 was not found.',
          'Cost center CC-9 was not found.',
        ],
        'UniqueId 2066': ['Vendor Payment requires one credit payment offset.'],
      },
    };

    expect(getUploadValidationItems(error)).toEqual([
      {
        location: 'Line 17 (UniqueId 2065) Account',
        message: 'Main account 999999 was not found.',
      },
      {
        location: 'Line 17 (UniqueId 2065) Account',
        message: 'Cost center CC-9 was not found.',
      },
      {
        location: 'UniqueId 2066',
        message: 'Vendor Payment requires one credit payment offset.',
      },
    ]);
  });

  it('returns no rows when the response has no validation details', () => {
    expect(getUploadValidationItems(null)).toEqual([]);
  });

  it('renders the validation count, source location, and business message', () => {
    const error: ErrorRes = {
      code: 400,
      message:
        'Cash Out pre-format validation failed. No journal request was generated.',
      validationErrors: {
        'Line 17 (UniqueId 2065) Account': [
          'Main account 999999 was not found.',
        ],
      },
    };

    render(<UploadValidationErrors error={error} />);

    expect(screen.getByText('1 validation error found')).toBeTruthy();
    expect(screen.getByText('Line 17 (UniqueId 2065) Account')).toBeTruthy();
    expect(screen.getByText('Main account 999999 was not found.')).toBeTruthy();
    expect(screen.getByText(/No journal request was generated/)).toBeTruthy();
  });
});
