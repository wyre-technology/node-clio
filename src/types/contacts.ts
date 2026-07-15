import type { ClioListParams } from './common.js';
import type { CurrencyRef } from './matters.js';

/** Field names verified against https://docs.developers.clio.com/clio-manage/api-reference/#tag/Contacts */

export type ContactType = 'Person' | 'Company';

export interface ContactAddress {
  id?: number;
  etag?: string;
  /** Address label, e.g. `"Work"`, `"Home"`. */
  name?: string;
  street?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  primary?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContactEmailAddress {
  id?: number;
  name?: string;
  address?: string;
  default_email?: boolean;
}

export interface ContactPhoneNumber {
  id?: number;
  name?: string;
  number?: string;
  default_number?: boolean;
}

/**
 * A Contact: a Person or Company record -- clients, opposing counsel, witnesses,
 * etc. Fields confirmed against the API reference's `Contact#show`/`Contact#index`
 * response sample.
 */
export interface Contact {
  id: number;
  etag?: string;
  /** Full display name (for a Company, this is the company name). */
  name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  date_of_birth?: string;
  type?: ContactType;
  created_at?: string;
  updated_at?: string;
  prefix?: string;
  title?: string;
  initials?: string;
  clio_connect_email?: string;
  locked_clio_connect_email?: boolean;
  client_connect_user_id?: number;
  primary_email_address?: string;
  secondary_email_address?: string;
  primary_phone_number?: string;
  secondary_phone_number?: string;
  ledes_client_id?: string;
  has_clio_for_clients_permission?: boolean;
  is_client?: boolean;
  is_clio_for_client_user?: boolean;
  is_co_counsel?: boolean;
  is_bill_recipient?: boolean;
  sales_tax_number?: string;
  currency?: CurrencyRef;
  require_utbms_codes?: boolean;
  addresses?: ContactAddress[];
  email_addresses?: ContactEmailAddress[];
  phone_numbers?: ContactPhoneNumber[];
  activity_rates?: Array<{
    id: number;
    etag?: string;
    rate?: number;
    flat_rate?: boolean;
    contact_id?: number;
    co_counsel_contact_id?: number;
    created_at?: string;
    updated_at?: string;
  }>;
  custom_field_values?: Array<{
    id?: string;
    etag?: string;
    field_name?: string;
    field_type?: string;
    value?: unknown;
  }>;
}

export interface ContactListParams extends ClioListParams {
  /** Filter to contacts that are clients. */
  client_only?: boolean;
  clio_connect_only?: boolean;
  email_only?: boolean;
  type?: ContactType;
  /** Filter to those whose last name / company name starts with this single uppercase letter. */
  initial?: string;
  /** Wildcard search across name, title, email, address, phone, custom fields, related matter name. */
  query?: string;
  ids?: number[];
  exclude_ids?: number[];
}

/**
 * Request body for `POST /contacts.json`. `name` and `type` are required by Clio.
 * For a `Person`, also set `first_name`/`last_name`. For a `Company`, `name` is
 * the company's name.
 */
export interface ContactCreateData {
  name: string;
  type: ContactType;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  prefix?: string;
  title?: string;
  date_of_birth?: string;
  clio_connect_email?: string;
  ledes_client_id?: string;
  sales_tax_number?: string;
  require_utbms_codes?: boolean;
  /** For a Person contact, associates them with an employer Company contact. */
  company?: { id: number };
  currency?: { id: number };
  addresses?: Array<Omit<ContactAddress, 'id' | 'etag' | 'created_at' | 'updated_at'>>;
  email_addresses?: ContactEmailAddress[];
  phone_numbers?: ContactPhoneNumber[];
  custom_field_values?: Array<{ value: unknown; custom_field: { id: number } }>;
  [key: string]: unknown;
}

/** Request body for `PATCH /contacts/{id}.json`. All fields optional. */
export type ContactUpdateData = Partial<ContactCreateData>;
