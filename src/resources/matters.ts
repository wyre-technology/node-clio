import type { HttpClient } from '../http.js';
import { unwrap } from '../http.js';
import { toPage, type Page } from '../pagination.js';
import type { ClioListResponse, ClioSingleResponse } from '../types/common.js';
import type { Matter, MatterCreateData, MatterListParams, MatterUpdateData } from '../types/matters.js';

/**
 * Matters -- Clio's core case/file object (client, responsible attorney, status,
 * practice area, custom fields). Endpoints confirmed against
 * https://docs.developers.clio.com/clio-manage/api-reference/#tag/Matters
 */
export class MattersResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: MatterListParams): Promise<Page<Matter>> {
    const response = await this.http.request<ClioListResponse<Matter>>('/matters.json', { params });
    return toPage(response.data, response.meta);
  }

  async get(id: number, params?: { fields?: string }): Promise<Matter> {
    const response = await this.http.request<ClioSingleResponse<Matter>>(`/matters/${id}.json`, { params });
    return unwrap<Matter>(response);
  }

  async create(data: MatterCreateData, params?: { fields?: string }): Promise<Matter> {
    const response = await this.http.request<ClioSingleResponse<Matter>>('/matters.json', {
      method: 'POST',
      params,
      body: { data },
    });
    return unwrap<Matter>(response);
  }

  async update(id: number, data: MatterUpdateData, params?: { fields?: string }): Promise<Matter> {
    const response = await this.http.request<ClioSingleResponse<Matter>>(`/matters/${id}.json`, {
      method: 'PATCH',
      params,
      body: { data },
    });
    return unwrap<Matter>(response);
  }
}
