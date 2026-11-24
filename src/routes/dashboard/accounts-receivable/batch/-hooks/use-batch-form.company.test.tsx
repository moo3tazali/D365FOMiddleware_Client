import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const batchState = vi.hoisted(() => ({
  batch: null as null | Record<string, unknown>,
  isPending: false,
}));

vi.mock('./use-batch-query-data', () => ({
  useBatchQueryData: () => [batchState.batch, vi.fn()],
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: Object.assign(vi.fn(), { loading: vi.fn() }),
}));

vi.mock('@/router', () => ({
  ROUTES: {
    DASHBOARD: { ACCOUNTS_RECEIVABLE: { BATCH: { VIEW: '/ar/batch' } } },
  },
}));

vi.mock('@/hooks/use-parsed-pagination', () => ({
  useParsedPagination: () => ({}),
}));

vi.mock('@/hooks/use-mutation', () => ({
  useMutation: () => ({
    mutateAsync: vi.fn(),
    get isPending() {
      return batchState.isPending;
    },
    dismissLoading: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-services', () => ({
  useServices: () => ({
    accountReceivable: {
      mutationKey: ['ar'],
      upload: vi.fn(),
      isBillingCodeRequired: (type: number | string) =>
        [1, 2].includes(Number(type)),
    },
    dataBatch: {
      getQueryKey: () => ['data-batch'],
    },
  }),
}));

import { useBatchForm } from './use-batch-form';

const workbook = () =>
  new File(['x'], 'freight.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

describe('AR batch form: company selection and reset', () => {
  beforeEach(() => {
    batchState.batch = null;
    batchState.isPending = false;
  });

  it('locks the company selector while a submission is running', () => {
    batchState.isPending = true;
    const { result } = renderHook(() => useBatchForm());

    expect(result.current.form.isDisabled).toBe(true);
  });

  it('starts with no company selected: nothing is defaulted to M-P', () => {
    const { result } = renderHook(() => useBatchForm());

    expect(result.current.form.getValues('companyId')).toBe('');
  });

  it('rejects submission until a supported company is chosen', async () => {
    const { result } = renderHook(() => useBatchForm());

    await act(async () => {
      await result.current.form.trigger('companyId');
    });

    expect(result.current.form.getFieldState('companyId').error?.message).toBe(
      'Please select a company.',
    );
  });

  it('clears the file and billing classification when the company changes', () => {
    const { result } = renderHook(() => useBatchForm());

    act(() => {
      result.current.form.setValue('companyId', 'm-p');
      result.current.form.setValue('dataFile', [workbook()]);
      result.current.form.setValue('billingCodeId', 'INV-FW');
    });

    act(() => {
      result.current.form.setValue('companyId', 'mas');
      result.current.form.handleCompanyChange();
    });

    expect(result.current.form.getValues('companyId')).toBe('mas');
    expect(result.current.form.getValues('dataFile')).toBeNull();
    expect(result.current.form.getValues('billingCodeId')).toBe('');
  });

  it('restores the saved batch company and never overwrites it with a form default', () => {
    batchState.batch = {
      id: 'batch-1',
      company: 'mas',
      entryProcessorType: 1,
      billingCodeId: 'INV-FW',
    };

    const { result } = renderHook(() => useBatchForm());

    expect(result.current.form.getValues('companyId')).toBe('mas');
    expect(result.current.form.isDisabled).toBe(true);
  });
});
