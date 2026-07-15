import { describe, expect, it } from 'vitest';
import { createTestClient } from './helpers.js';
import { sampleEmailCommunication } from './fixtures/communications.js';

describe('CommunicationsResource (read-only)', () => {
  it('list() parses the envelope', async () => {
    const client = createTestClient();
    const page = await client.communications.list({ matter_id: 1001 });

    expect(page.data).toEqual([sampleEmailCommunication]);
  });

  it('get() unwraps a single communication', async () => {
    const client = createTestClient();
    const communication = await client.communications.get(3001);

    expect(communication).toEqual(sampleEmailCommunication);
    expect(communication.type).toBe('EmailCommunication');
  });

  it('does not expose create/update/delete methods', () => {
    const client = createTestClient();
    expect((client.communications as unknown as Record<string, unknown>).create).toBeUndefined();
    expect((client.communications as unknown as Record<string, unknown>).update).toBeUndefined();
    expect((client.communications as unknown as Record<string, unknown>).delete).toBeUndefined();
  });
});
