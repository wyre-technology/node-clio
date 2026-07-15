import type { HttpClient } from '../http.js';
import { unwrap } from '../http.js';
import { toPage, type Page } from '../pagination.js';
import type { ClioListResponse, ClioSingleResponse } from '../types/common.js';
import type { Bill, BillListParams } from '../types/bills.js';

/**
 * Bills (invoices). **Read-only in this SDK** -- billing/trust-accounting mutations
 * are out of scope for v1 (see the README). Endpoints confirmed against
 * https://docs.developers.clio.com/clio-manage/api-reference/#tag/Bills
 */
export class BillsResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: BillListParams): Promise<Page<Bill>> {
    const response = await this.http.request<ClioListResponse<Bill>>('/bills.json', { params });
    return toPage(response.data, response.meta);
  }

  async get(id: number, params?: { fields?: string }): Promise<Bill> {
    const response = await this.http.request<ClioSingleResponse<Bill>>(`/bills/${id}.json`, { params });
    return unwrap<Bill>(response);
  }
}
