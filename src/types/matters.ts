import type { ClioListParams } from './common.js';
import type { Contact } from './contacts.js';

/** Field names verified against https://docs.developers.clio.com/clio-manage/api-reference/#tag/Matters */

/**
 * Confirmed lowercase from the `Matter#index` filter enum and `Matter#create`/`#update`
 * request body enum (`"open" | "closed" | "pending"`). Note the API reference's
 * generated *response* example shows `"status": "Pending"` (capitalized) -- that may
 * just be Redoc's placeholder text rather than the real response casing, so
 * `Matter.status` below is typed loosely as `string` rather than this union.
 */
export type MatterStatus = 'open' | 'pending' | 'closed';

export interface CurrencyRef {
  id: number;
  etag?: string;
  code?: string;
  sign?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserRef {
  id: number;
  etag?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  initials?: string;
  enabled?: boolean;
  rate?: number;
  time_zone?: string;
  roles?: string[];
  subscription_type?: string;
  account_owner?: boolean;
  clio_connect?: boolean;
  default_calendar_id?: number;
  phone_number?: string;
  locale?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PracticeAreaRef {
  id: number;
  etag?: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MatterStageRef {
  id: number;
  etag?: string;
  practice_area_id?: string;
  name?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GroupRef {
  id: number;
  etag?: string;
  name?: string;
  type?: string;
  client_connect_user?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * A Matter: Clio's core case/file object. Fields confirmed against the API
 * reference's `Matter#show`/`Matter#index` response sample. Nested associations
 * (client, practice_area, etc.) only come back populated for the subfields you
 * request via `fields=` -- see the `fields` quirk documented in `types/common.ts`.
 */
export interface Matter {
  id: number;
  etag?: string;
  number?: number;
  /** Matter reference and label. Read-only or customizable depending on the account's manual_matter_numbering setting. */
  display_number?: string;
  custom_number?: string;
  currency?: CurrencyRef;
  description?: string;
  /** See the `MatterStatus` doc comment re: response casing uncertainty. */
  status?: string;
  location?: string;
  client_reference?: string;
  client_id?: number;
  /** The client contact this matter belongs to. */
  client?: Partial<Contact>;
  billable?: boolean;
  require_utbms_codes?: boolean;
  maildrop_address?: string;
  billing_method?: string;
  open_date?: string;
  close_date?: string;
  pending_date?: string;
  created_at?: string;
  updated_at?: string;
  shared?: boolean;
  has_tasks?: boolean;
  last_activity_date?: string;
  matter_stage_updated_at?: string;
  practice_area?: PracticeAreaRef;
  matter_stage?: MatterStageRef;
  responsible_attorney?: Partial<UserRef>;
  responsible_staff?: Partial<UserRef>;
  originating_attorney?: Partial<UserRef>;
  group?: GroupRef;
  custom_field_values?: Array<{
    id?: string;
    etag?: string;
    field_name?: string;
    field_type?: string;
    value?: unknown;
    custom_field?: { id: number; name?: string };
  }>;
}

export interface MatterListParams extends ClioListParams {
  billable?: boolean;
  client_id?: number;
  currency_id?: number;
  practice_area_id?: number;
  responsible_attorney_id?: number;
  responsible_staff_id?: number;
  originating_attorney_id?: number;
  group_id?: number;
  /** Comma-separated: `"open,pending"`. */
  status?: string;
  /** Wildcard search across display_number, number, description, and the client's name. */
  query?: string;
  ids?: number[];
}

/** Request body for `POST /matters.json`. `client` and `description` are required by Clio. */
export interface MatterCreateData {
  client: { id: number };
  description: string;
  billable?: boolean;
  client_reference?: string;
  close_date?: string;
  open_date?: string;
  pending_date?: string;
  currency?: { id: number };
  display_number?: string;
  location?: string;
  status?: MatterStatus;
  practice_area?: { id: number };
  matter_stage?: { id: number };
  responsible_attorney?: { id: number };
  responsible_staff?: { id: number };
  originating_attorney?: { id: number };
  group?: { id: number };
  require_utbms_codes?: boolean;
  /** Resets the matter's number based on the account's matter numbering scheme. Default: false. */
  reset_matter_number?: boolean;
  custom_field_values?: Array<{ value: unknown; custom_field: { id: number } }>;
  [key: string]: unknown;
}

/** Request body for `PATCH /matters/{id}.json`. All fields optional. */
export type MatterUpdateData = Partial<Omit<MatterCreateData, 'client'>> & {
  client?: { id: number };
};
