import { describe, expect, it } from 'vitest';
import { createTestClient } from './helpers.js';
import { sampleBill } from './fixtures/bills.js';

describe('BillsResource (read-only)', () => {
  it('list() parses the envelope', async () => {
    const client = createTestClient();
    const page = await client.bills.list({ matter_id: 1001 });

    expect(page.data).toEqual([sampleBill]);
  });

  it('get() unwraps a single bill', async () => {
    const client = createTestClient();
    const bill = await client.bills.get(7001);

    expect(bill).toEqual(sampleBill);
    expect(bill.state).toBe('awaiting_payment');
  });

  it('does not expose mutation methods', () => {
    const client = createTestClient();
    const resource = client.bills as unknown as Record<string, unknown>;
    expect(resource.create).toBeUndefined();
    expect(resource.update).toBeUndefined();
    expect(resource.delete).toBeUndefined();
  });
});
