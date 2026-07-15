import { describe, expect, it } from 'vitest';
import { createTestClient } from './helpers.js';
import { sampleMatter, sampleMatter2 } from './fixtures/matters.js';

describe('MattersResource', () => {
  it('list() parses the paginated envelope', async () => {
    const client = createTestClient();
    const page = await client.matters.list({ status: 'open' });

    expect(page.data).toEqual([sampleMatter, sampleMatter2]);
    expect(page.hasMore).toBe(true);
    expect(page.nextUrl).toContain('page_token=next-matters-token');
  });

  it('get() unwraps a single matter', async () => {
    const client = createTestClient();
    const matter = await client.matters.get(1001);

    expect(matter).toEqual(sampleMatter);
    expect(matter.display_number).toBe('Smith, Jane - 1001');
  });

  it('create() posts and unwraps the created matter', async () => {
    const client = createTestClient();
    const matter = await client.matters.create({
      client: { id: 501 },
      description: 'Personal injury claim',
    });

    expect(matter).toEqual(sampleMatter);
  });

  it('update() patches and unwraps the updated matter', async () => {
    const client = createTestClient();
    const matter = await client.matters.update(1001, { status: 'closed' });

    expect(matter).toEqual(sampleMatter);
  });
});
