import { describe, expect, it } from 'vitest';
import { createTestClient } from './helpers.js';

/**
 * Deliberate v1 scope limits (see README): no `delete()` anywhere in this SDK,
 * even on resources that otherwise support create/update.
 */
describe('scope limitations: no delete() on any resource', () => {
  const client = createTestClient();
  const resources = {
    matters: client.matters,
    contacts: client.contacts,
    activities: client.activities,
    communications: client.communications,
    tasks: client.tasks,
    documents: client.documents,
    calendarEntries: client.calendarEntries,
    bills: client.bills,
  };

  it.each(Object.entries(resources))('%s has no delete()', (_name, resource) => {
    expect((resource as unknown as Record<string, unknown>).delete).toBeUndefined();
  });
});
