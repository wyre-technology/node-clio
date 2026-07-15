import { describe, expect, it } from 'vitest';
import { createTestClient } from './helpers.js';
import { sampleCalendarEntry } from './fixtures/calendar-entries.js';

describe('CalendarEntriesResource (read-only)', () => {
  it('list() parses the envelope', async () => {
    const client = createTestClient();
    const page = await client.calendarEntries.list({ matter_id: 1001 });

    expect(page.data).toEqual([sampleCalendarEntry]);
  });

  it('get() unwraps a single calendar entry', async () => {
    const client = createTestClient();
    const entry = await client.calendarEntries.get(6001);

    expect(entry).toEqual(sampleCalendarEntry);
    expect(entry.summary).toBe('Deposition of J. Smith');
  });
});
