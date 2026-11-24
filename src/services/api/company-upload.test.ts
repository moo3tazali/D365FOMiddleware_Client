import { beforeEach, describe, expect, it, vi } from 'vitest';
import { serialize } from 'object-to-formdata';

import { COMPANY_REQUIRED_MESSAGE } from '@/constants/company';
import { TEntryProcessorTypes } from '@/interfaces/data-batch';

const save = vi.hoisted(() => vi.fn());

vi.mock('../core/sync', () => ({
  sync: { save, fetch: vi.fn() },
}));

import { AccountReceivable } from './account-receivable';
import { CashIn } from './cash-in';
import { Ledger } from './ledger';
import { Vendor } from './vendor';

/** Same options the sync service uses for multipart uploads. */
const toMultipart = (data: Record<string, unknown>) =>
  serialize(data, { indices: true, nullsAsUndefineds: true });

const workbook = () =>
  new File(['x'], 'batch.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

describe('upload request contract', () => {
  beforeEach(() => {
    save.mockReset();
    save.mockResolvedValue({ id: 'batch-1' });
  });

  it('sends companyId as a multipart field for MAS and M-P', () => {
    const mas = toMultipart({ companyId: 'mas', dataFile: workbook() });
    const mp = toMultipart({ companyId: 'm-p', dataFile: workbook() });

    expect(mas.get('companyId')).toBe('mas');
    expect(mas.get('dataFile')).toBeInstanceOf(File);
    expect(mp.get('companyId')).toBe('m-p');
  });

  it('keeps subtype fields such as billingCodeId in the same FormData', () => {
    const form = toMultipart({
      companyId: 'mas',
      billingCodeId: 'INV-FW',
      dataFile: workbook(),
    });
    expect(form.get('companyId')).toBe('mas');
    expect(form.get('billingCodeId')).toBe('INV-FW');
  });

  it('Account Receivable freight upload posts companyId=mas with formData enabled', async () => {
    await new AccountReceivable().upload({
      type: TEntryProcessorTypes.AccountReceivableFreight,
      data: { companyId: 'mas', billingCodeId: 'INV-FW', dataFile: workbook() },
    });

    expect(save).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ companyId: 'mas', billingCodeId: 'INV-FW' }),
      expect.objectContaining({ formData: true }),
    );
  });

  it('Vendor and Ledger uploads carry the selected company', async () => {
    await new Vendor().upload({
      type: TEntryProcessorTypes.VendorFreight,
      data: { companyId: 'm-p', dataFile: workbook() },
    });
    await new Ledger().upload({
      type: TEntryProcessorTypes.LedgerFreightClosingEntry,
      data: { companyId: 'mas', dataFile: workbook() },
    });

    expect(save.mock.calls[0][1]).toMatchObject({ companyId: 'm-p' });
    expect(save.mock.calls[1][1]).toMatchObject({ companyId: 'mas' });
  });

  it('Cash-In upload carries the selected company', async () => {
    await new CashIn().upload({
      type: TEntryProcessorTypes.CashInFreight,
      data: { companyId: 'mas', dataFile: workbook() },
    });

    expect(save.mock.calls[0][1]).toMatchObject({ companyId: 'mas' });
  });

  it('does not send any request when the company is missing', async () => {
    await expect(
      new AccountReceivable().upload({
        type: TEntryProcessorTypes.AccountReceivableFreight,
        data: {
          companyId: '',
          billingCodeId: 'INV-FW',
          dataFile: workbook(),
        },
      }),
    ).rejects.toThrow(COMPANY_REQUIRED_MESSAGE);

    expect(save).not.toHaveBeenCalled();
  });
});

describe('ordinary Yard upload', () => {
  beforeEach(() => {
    save.mockReset();
    save.mockResolvedValue({ id: 'batch-1' });
  });

  it('uses the same endpoint and template for M-P and MAS; only companyId differs', async () => {
    await new AccountReceivable().upload({
      type: TEntryProcessorTypes.AccountReceivableYard,
      data: { companyId: 'm-p', dataFile: workbook() },
    });
    await new AccountReceivable().upload({
      type: TEntryProcessorTypes.AccountReceivableYard,
      data: { companyId: 'mas', dataFile: workbook() },
    });

    const [mpRoute, mpBody] = save.mock.calls[0];
    const [masRoute, masBody] = save.mock.calls[1];
    expect(masRoute).toBe(mpRoute);
    expect(mpBody).toMatchObject({ companyId: 'm-p' });
    expect(masBody).toMatchObject({ companyId: 'mas' });
    expect(Object.keys(masBody).sort()).toEqual(Object.keys(mpBody).sort());
  });
});
