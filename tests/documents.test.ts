import { describe, expect, it } from 'vitest';
import { createTestClient } from './helpers.js';
import { sampleDocument } from './fixtures/documents.js';

describe('DocumentsResource (metadata only, read-only)', () => {
  it('list() parses the envelope', async () => {
    const client = createTestClient();
    const page = await client.documents.list({ matter_id: 1001 });

    expect(page.data).toEqual([sampleDocument]);
  });

  it('get() unwraps a single document', async () => {
    const client = createTestClient();
    const document = await client.documents.get(5001);

    expect(document).toEqual(sampleDocument);
    expect(document.content_type).toBe('application/pdf');
  });

  it('does not expose content upload/download or mutation methods', () => {
    const client = createTestClient();
    const resource = client.documents as unknown as Record<string, unknown>;
    expect(resource.download).toBeUndefined();
    expect(resource.upload).toBeUndefined();
    expect(resource.create).toBeUndefined();
    expect(resource.update).toBeUndefined();
    expect(resource.delete).toBeUndefined();
  });
});
