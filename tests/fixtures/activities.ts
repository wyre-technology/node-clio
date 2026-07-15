import type { Activity } from '../../src/types/activities.js';

export const sampleTimeEntry: Activity = {
  id: 2001,
  etag: '"etag-activity-2001"',
  type: 'TimeEntry',
  date: '2026-02-05',
  quantity: 3600,
  quantity_in_hours: 1.0,
  price: 250,
  note: 'Drafted settlement demand letter',
  billed: false,
  non_billable: false,
  total: 250,
  created_at: '2026-02-05T16:00:00Z',
  updated_at: '2026-02-05T16:00:00Z',
  matter: { id: 1001, display_number: 'Smith, Jane - 1001' },
};

export const sampleExpenseEntry: Activity = {
  id: 2002,
  etag: '"etag-activity-2002"',
  type: 'ExpenseEntry',
  date: '2026-02-06',
  price: 45.5,
  note: 'Filing fee',
  billed: false,
  total: 45.5,
  created_at: '2026-02-06T09:00:00Z',
  updated_at: '2026-02-06T09:00:00Z',
  matter: { id: 1001, display_number: 'Smith, Jane - 1001' },
};

export const activityListResponse = {
  data: [sampleTimeEntry, sampleExpenseEntry],
  meta: { paging: {} },
};

export const activitySingleResponse = { data: sampleTimeEntry };
