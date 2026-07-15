import type { ClioListParams } from './common.js';
import type { Matter } from './matters.js';

/** Field names verified against https://docs.developers.clio.com/clio-manage/api-reference/#tag/CalendarEntries */

export interface CalendarOwnerRef {
  id: number;
  etag?: string;
  name?: string;
  color?: string;
  light_color?: string;
  court_rules_default_calendar?: boolean;
  permission?: string;
  type?: string;
  visible?: boolean;
  source?: 'web' | 'mobile';
  created_at?: string;
  updated_at?: string;
}

export interface ConferenceMeetingRef {
  id?: number;
  conference_id?: number;
  conference_password?: string;
  join_url?: string;
  type?: string;
  source_id?: number;
  etag?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * A CalendarEntry -- a logged calendar event, optionally associated with a matter.
 * **Read-only in this SDK** (see the README's scope limitations). Fields confirmed
 * against the API reference's `CalendarEntry#show`/`CalendarEntry#index` response
 * sample. Note `id` is documented as a `string` (not `integer`), unlike most other
 * Clio resources -- likely to encode individual occurrences of recurring entries.
 */
export interface CalendarEntry {
  id: string;
  etag?: string;
  summary?: string;
  description?: string;
  location?: string;
  start_at?: string;
  start_date?: string;
  start_time?: string;
  end_at?: string;
  end_date?: string;
  end_time?: string;
  all_day?: boolean;
  recurrence_rule?: string;
  parent_calendar_entry_id?: number;
  court_rule?: boolean;
  permission?: string;
  calendar_owner_id?: number;
  start_at_time_zone?: string;
  time_entries_count?: number;
  calendar_owner?: CalendarOwnerRef;
  conference_meeting?: ConferenceMeetingRef;
  matter?: Partial<Matter>;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarEntryListParams extends ClioListParams {
  calendar_id?: number;
  matter_id?: number;
  /** Return a record for each occurrence of a recurring event, rather than one record for the series. */
  expanded?: boolean;
  has_court_rule?: boolean;
  is_all_day?: boolean;
  /** ISO-8601 timestamp -- entries ending on or after this time. */
  from?: string;
  /** ISO-8601 timestamp -- entries beginning on or before this time. */
  to?: string;
  owner_entries_across_all_users?: boolean;
  source?: 'web' | 'mobile';
  visible?: boolean;
  external_property_name?: string;
  external_property_value?: string;
  /** Wildcard search on the calendar entry. */
  query?: string;
  ids?: string[];
}
