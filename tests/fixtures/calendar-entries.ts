import type { CalendarEntry } from '../../src/types/calendar-entries.js';

export const sampleCalendarEntry: CalendarEntry = {
  id: '6001',
  etag: '"etag-calendar-6001"',
  summary: 'Deposition of J. Smith',
  description: 'Deposition at opposing counsel\'s office',
  location: '123 Main St, Suite 400',
  start_at: '2026-03-10T15:00:00Z',
  end_at: '2026-03-10T17:00:00Z',
  all_day: false,
  matter: { id: 1001, display_number: 'Smith, Jane - 1001' },
  created_at: '2026-02-09T09:00:00Z',
  updated_at: '2026-02-09T09:00:00Z',
};

export const calendarEntryListResponse = {
  data: [sampleCalendarEntry],
  meta: { paging: {} },
};

export const calendarEntrySingleResponse = { data: sampleCalendarEntry };
