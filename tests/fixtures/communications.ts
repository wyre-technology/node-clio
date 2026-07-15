import type { Communication } from '../../src/types/communications.js';

export const sampleEmailCommunication: Communication = {
  id: 3001,
  etag: '"etag-comm-3001"',
  subject: 'Re: Settlement offer',
  body: 'Please see the attached settlement offer for your review.',
  type: 'EmailCommunication',
  date: '2026-02-07',
  received_at: '2026-02-07T13:45:00Z',
  time_entries_count: 1,
  created_at: '2026-02-07T13:45:00Z',
  updated_at: '2026-02-07T13:45:00Z',
  matter: { id: 1001, display_number: 'Smith, Jane - 1001' },
};

export const communicationListResponse = {
  data: [sampleEmailCommunication],
  meta: { paging: {} },
};

export const communicationSingleResponse = { data: sampleEmailCommunication };
