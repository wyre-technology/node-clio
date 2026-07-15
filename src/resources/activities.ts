import type { HttpClient } from '../http.js';
import { unwrap } from '../http.js';
import { toPage, type Page } from '../pagination.js';
import type { ClioListResponse, ClioSingleResponse } from '../types/common.js';
import type { Activity, ActivityCreateData, ActivityListParams } from '../types/activities.js';

/**
 * Activities -- time entries and expense entries logged against matters. Endpoints
 * confirmed against https://docs.developers.clio.com/clio-manage/api-reference/#tag/Activities
 * No `update()` in this v1 SDK (see the README's scope limitations).
 */
export class ActivitiesResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: ActivityListParams): Promise<Page<Activity>> {
    const response = await this.http.request<ClioListResponse<Activity>>('/activities.json', { params });
    return toPage(response.data, response.meta);
  }

  async get(id: number, params?: { fields?: string }): Promise<Activity> {
    const response = await this.http.request<ClioSingleResponse<Activity>>(`/activities/${id}.json`, { params });
    return unwrap<Activity>(response);
  }

  async create(data: ActivityCreateData, params?: { fields?: string }): Promise<Activity> {
    const response = await this.http.request<ClioSingleResponse<Activity>>('/activities.json', {
      method: 'POST',
      params,
      body: { data },
    });
    return unwrap<Activity>(response);
  }
}
