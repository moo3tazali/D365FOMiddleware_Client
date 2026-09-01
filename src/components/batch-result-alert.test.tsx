import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    params,
    to,
    ...props
  }: PropsWithChildren<{
    params: { batchId: string };
    to: string;
    className?: string;
  }>) => (
    <a href={to.replace('$batchId', params.batchId)} {...props}>
      {children}
    </a>
  ),
}));

import { BatchResultAlert } from './batch-result-alert';

describe('BatchResultAlert', () => {
  it('restores the View Errors button and targets the batch error page', () => {
    render(
      <BatchResultAlert
        errorCount={10852}
        batchId='507f1f77bcf86cd799439011'
        errorsRoute='/dashboard/cash-out/batch/$batchId/errors'
      />,
    );

    expect(
      screen.getByText('10,852 errors found while processing this batch'),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /View Errors/i }).getAttribute('href'),
    ).toBe('/dashboard/cash-out/batch/507f1f77bcf86cd799439011/errors');
  });

  it('shows skipped UniqueIds without listing every posting error', () => {
    render(
      <BatchResultAlert
        errorCount={0}
        skipCount={42}
        batchId='507f1f77bcf86cd799439011'
        errorsRoute='/dashboard/cash-out/batch/$batchId/errors'
      />,
    );

    expect(
      screen.getByText('42 UniqueId issues skipped during posting'),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /View skipped lines/i }).getAttribute(
        'href',
      ),
    ).toBe('/dashboard/cash-out/batch/507f1f77bcf86cd799439011/errors');
  });
});
