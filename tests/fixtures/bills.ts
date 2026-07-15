import type { Bill } from '../../src/types/bills.js';

export const sampleBill: Bill = {
  id: 7001,
  etag: '"etag-bill-7001"',
  number: 'INV-1001',
  issued_at: '2026-02-01',
  due_at: '2026-03-01',
  subject: 'February invoice',
  type: 'MatterBill',
  balance: 1250.0,
  state: 'awaiting_payment',
  kind: 'revenue_kind',
  total: 1250.0,
  paid: 0,
  due: 1250.0,
  matters: [{ id: 1001, display_number: 'Smith, Jane - 1001' }],
  created_at: '2026-02-01T08:00:00Z',
  updated_at: '2026-02-01T08:00:00Z',
};

export const billListResponse = {
  data: [sampleBill],
  meta: { paging: {} },
};

export const billSingleResponse = { data: sampleBill };
