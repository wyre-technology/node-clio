import type { Contact } from '../../src/types/contacts.js';

export const samplePersonContact: Contact = {
  id: 501,
  etag: '"etag-contact-501"',
  name: 'Jane Smith',
  first_name: 'Jane',
  last_name: 'Smith',
  type: 'Person',
  primary_email_address: 'jane.smith@example.com',
  primary_phone_number: '+1-555-0100',
  is_client: true,
  created_at: '2026-01-10T08:00:00Z',
  updated_at: '2026-01-10T08:00:00Z',
};

export const sampleCompanyContact: Contact = {
  id: 502,
  etag: '"etag-contact-502"',
  name: 'Acme Corp',
  type: 'Company',
  primary_email_address: 'contact@acme.example.com',
  is_client: true,
  created_at: '2026-01-12T08:00:00Z',
  updated_at: '2026-01-12T08:00:00Z',
};

export const contactListResponse = {
  data: [samplePersonContact, sampleCompanyContact],
  meta: { paging: {} },
};

export const contactSingleResponse = { data: samplePersonContact };
