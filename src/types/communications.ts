import type { ClioListParams } from './common.js';
import type { Matter, UserRef } from './matters.js';

/** Field names verified against https://docs.developers.clio.com/clio-manage/api-reference/#tag/Communications */

export type CommunicationType = 'EmailCommunication' | 'PhoneCommunication';

export interface CommunicationParticipant {
  id: number;
  etag?: string;
  type?: string;
  identifier?: string;
  secondary_identifier?: string;
  enabled?: boolean;
  name?: string;
  initials?: string;
  job_title_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExternalPropertyEntry {
  id: number;
  etag?: string;
  name?: string;
  value?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * A Communication: a logged email or phone call associated with a matter.
 * **Read-only in this SDK** -- see the README's scope limitations (logged
 * communications routinely contain privileged content). Fields confirmed against
 * the API reference's `Communication#show`/`Communication#index` response sample.
 */
export interface Communication {
  id: number;
  etag?: string;
  subject?: string;
  /** Present for `EmailCommunication`; may be redacted/absent depending on permissions. */
  body?: string;
  type?: CommunicationType;
  date?: string;
  time_entries_count?: number;
  created_at?: string;
  updated_at?: string;
  received_at?: string;
  user?: Partial<UserRef>;
  matter?: Partial<Matter>;
  senders?: CommunicationParticipant[];
  receivers?: CommunicationParticipant[];
  external_properties?: ExternalPropertyEntry[];
}

export interface CommunicationListParams extends ClioListParams {
  contact_id?: number;
  matter_id?: number;
  user_id?: number;
  type?: CommunicationType;
  /** ISO-8601 date -- communications occurring on this exact date. */
  date?: string;
  received_at?: string;
  received_before?: string;
  received_since?: string;
  having_time_entries?: boolean;
  external_property_name?: string;
  external_property_value?: string;
  /** Wildcard search across `subject`/`body`. */
  query?: string;
  ids?: number[];
}
