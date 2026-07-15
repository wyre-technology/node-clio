import { describe, expect, it } from 'vitest';
import { createTestClient } from './helpers.js';
import { samplePersonContact, sampleCompanyContact } from './fixtures/contacts.js';

describe('ContactsResource', () => {
  it('list() parses the envelope', async () => {
    const client = createTestClient();
    const page = await client.contacts.list({ type: 'Person' });

    expect(page.data).toEqual([samplePersonContact, sampleCompanyContact]);
  });

  it('get() unwraps a single contact', async () => {
    const client = createTestClient();
    const contact = await client.contacts.get(501);

    expect(contact).toEqual(samplePersonContact);
    expect(contact.type).toBe('Person');
  });

  it('create() posts and unwraps the created contact', async () => {
    const client = createTestClient();
    const contact = await client.contacts.create({ name: 'Jane Smith', type: 'Person', first_name: 'Jane', last_name: 'Smith' });

    expect(contact).toEqual(samplePersonContact);
  });

  it('update() patches and unwraps the updated contact', async () => {
    const client = createTestClient();
    const contact = await client.contacts.update(501, { primary_phone_number: '+1-555-0199' });

    expect(contact).toEqual(samplePersonContact);
  });
});
