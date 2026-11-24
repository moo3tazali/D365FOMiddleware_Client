import { describe, expect, it, vi } from 'vitest';

vi.mock('../core/sync', () => ({
  sync: { fetch: vi.fn(), save: vi.fn() },
}));

import { DataBatch } from './data-batch';

/**
 * Batch list cache keys must carry the company filter, so one company's page is
 * never shown under another company's filter.
 */
describe('batch list query keys', () => {
  const api = new DataBatch();

  it('includes the company filter in the query key', () => {
    const [, query] = api.getQueryKey('accountReceivable', { company: 'mas' });
    expect(query).toMatchObject({ company: 'mas' });
  });

  it('keeps M-P and MAS list caches apart', () => {
    const mp = api.batchQueryOptions('cashIn', { company: 'm-p' }).queryKey;
    const mas = api.batchQueryOptions('cashIn', { company: 'mas' }).queryKey;
    expect(mp).not.toEqual(mas);
  });

  it('sends the company to the server list endpoint as a query parameter', async () => {
    const { sync } = await import('../core/sync');
    const fetch = sync.fetch as unknown as ReturnType<typeof vi.fn>;
    fetch.mockResolvedValueOnce({ items: [], total: 0 });

    await api.list({ company: 'mas', maxCount: 20 } as never);

    expect(fetch).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({
        query: expect.objectContaining({ company: 'mas' }),
      }),
    );
  });
});
