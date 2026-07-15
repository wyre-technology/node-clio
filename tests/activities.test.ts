import { describe, expect, it } from 'vitest';
import { createTestClient } from './helpers.js';
import { sampleTimeEntry, sampleExpenseEntry } from './fixtures/activities.js';

describe('ActivitiesResource', () => {
  it('list() parses the envelope', async () => {
    const client = createTestClient();
    const page = await client.activities.list({ matter_id: 1001 });

    expect(page.data).toEqual([sampleTimeEntry, sampleExpenseEntry]);
  });

  it('get() unwraps a single activity', async () => {
    const client = createTestClient();
    const activity = await client.activities.get(2001);

    expect(activity).toEqual(sampleTimeEntry);
    expect(activity.type).toBe('TimeEntry');
  });

  it('create() posts and unwraps the created activity', async () => {
    const client = createTestClient();
    const activity = await client.activities.create({
      date: '2026-02-05',
      type: 'TimeEntry',
      matter: { id: 1001 },
      quantity: 3600,
    });

    expect(activity).toEqual(sampleTimeEntry);
  });
});
