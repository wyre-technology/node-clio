import type { HttpClient } from '../http.js';
import { unwrap } from '../http.js';
import { toPage, type Page } from '../pagination.js';
import type { ClioListResponse, ClioSingleResponse } from '../types/common.js';
import type { CalendarEntry, CalendarEntryListParams } from '../types/calendar-entries.js';

/**
 * Calendar Entries. **Read-only in this SDK** (see the README's scope limitations).
 * Endpoints confirmed against
 * https://docs.developers.clio.com/clio-manage/api-reference/#tag/CalendarEntries
 * -- note the real path segment is `calendar_entries` (underscore), even though this
 * module/resource is named `calendar-entries` (hyphen) per this SDK's file-naming
 * convention.
 */
export class CalendarEntriesResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: CalendarEntryListParams): Promise<Page<CalendarEntry>> {
    const response = await this.http.request<ClioListResponse<CalendarEntry>>('/calendar_entries.json', { params });
    return toPage(response.data, response.meta);
  }

  /**
   * @param id Clio documents the path parameter as an `int64`, even though the
   * response schema types `CalendarEntry.id` as a `string` -- pass the numeric ID.
   */
  async get(id: number, params?: { fields?: string }): Promise<CalendarEntry> {
    const response = await this.http.request<ClioSingleResponse<CalendarEntry>>(`/calendar_entries/${id}.json`, {
      params,
    });
    return unwrap<CalendarEntry>(response);
  }
}
