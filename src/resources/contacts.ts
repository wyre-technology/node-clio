import type { HttpClient } from '../http.js';
import { unwrap } from '../http.js';
import { toPage, type Page } from '../pagination.js';
import type { ClioListResponse, ClioSingleResponse } from '../types/common.js';
import type { Contact, ContactCreateData, ContactListParams, ContactUpdateData } from '../types/contacts.js';

/**
 * Contacts -- People and Companies (clients, opposing counsel, witnesses). Endpoints
 * confirmed against https://docs.developers.clio.com/clio-manage/api-reference/#tag/Contacts
 */
export class ContactsResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: ContactListParams): Promise<Page<Contact>> {
    const response = await this.http.request<ClioListResponse<Contact>>('/contacts.json', { params });
    return toPage(response.data, response.meta);
  }

  async get(id: number, params?: { fields?: string }): Promise<Contact> {
    const response = await this.http.request<ClioSingleResponse<Contact>>(`/contacts/${id}.json`, { params });
    return unwrap<Contact>(response);
  }

  async create(data: ContactCreateData, params?: { fields?: string }): Promise<Contact> {
    const response = await this.http.request<ClioSingleResponse<Contact>>('/contacts.json', {
      method: 'POST',
      params,
      body: { data },
    });
    return unwrap<Contact>(response);
  }

  async update(id: number, data: ContactUpdateData, params?: { fields?: string }): Promise<Contact> {
    const response = await this.http.request<ClioSingleResponse<Contact>>(`/contacts/${id}.json`, {
      method: 'PATCH',
      params,
      body: { data },
    });
    return unwrap<Contact>(response);
  }
}
