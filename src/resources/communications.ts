import type { HttpClient } from '../http.js';
import { unwrap } from '../http.js';
import { toPage, type Page } from '../pagination.js';
import type { ClioListResponse, ClioSingleResponse } from '../types/common.js';
import type { Communication, CommunicationListParams } from '../types/communications.js';

/**
 * Communications -- logged emails/calls associated with a matter. **Deliberately
 * read-only in this SDK**: this data routinely contains privileged attorney-client
 * content, so write/mutate support is out of scope until that data path gets its
 * own review (see the README). Endpoints confirmed against
 * https://docs.developers.clio.com/clio-manage/api-reference/#tag/Communications
 */
export class CommunicationsResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: CommunicationListParams): Promise<Page<Communication>> {
    const response = await this.http.request<ClioListResponse<Communication>>('/communications.json', { params });
    return toPage(response.data, response.meta);
  }

  async get(id: number, params?: { fields?: string }): Promise<Communication> {
    const response = await this.http.request<ClioSingleResponse<Communication>>(`/communications/${id}.json`, {
      params,
    });
    return unwrap<Communication>(response);
  }
}
