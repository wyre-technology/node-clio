import type { Matter } from '../../src/types/matters.js';

export const sampleMatter: Matter = {
  id: 1001,
  etag: '"etag-matter-1001"',
  number: 1001,
  display_number: 'Smith, Jane - 1001',
  description: 'Personal injury claim',
  status: 'open',
  client_id: 501,
  client: { id: 501, name: 'Jane Smith', type: 'Person' },
  billable: true,
  open_date: '2026-01-15',
  created_at: '2026-01-15T14:00:00Z',
  updated_at: '2026-02-01T09:30:00Z',
  practice_area: { id: 7, name: 'Personal Injury' },
  responsible_attorney: { id: 12, name: 'Alex Attorney' },
};

export const sampleMatter2: Matter = {
  id: 1002,
  etag: '"etag-matter-1002"',
  number: 1002,
  display_number: 'Doe, John - 1002',
  description: 'Contract dispute',
  status: 'pending',
  client_id: 502,
  billable: true,
  open_date: '2026-02-01',
  created_at: '2026-02-01T10:00:00Z',
  updated_at: '2026-02-10T11:15:00Z',
};

export const matterListResponse = {
  data: [sampleMatter, sampleMatter2],
  meta: {
    paging: {
      next: 'https://app.clio.com/api/v4/matters.json?page_token=next-matters-token',
    },
  },
};

export const matterSingleResponse = { data: sampleMatter };
