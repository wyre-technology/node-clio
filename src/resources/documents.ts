import type { HttpClient } from '../http.js';
import { unwrap } from '../http.js';
import { toPage, type Page } from '../pagination.js';
import type { ClioListResponse, ClioSingleResponse } from '../types/common.js';
import type { Document, DocumentListParams } from '../types/documents.js';

/**
 * Documents -- **metadata only**. Clio's API also exposes document content
 * upload/download (`Document#download`) and copy/create/update/destroy, none of
 * which this SDK implements: documents are the highest-sensitivity object in a
 * legal practice-management system, and content transfer deserves its own
 * dedicated security review before this SDK moves bytes in or out (see the
 * README). Endpoints confirmed against
 * https://docs.developers.clio.com/clio-manage/api-reference/#tag/Documents
 */
export class DocumentsResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: DocumentListParams): Promise<Page<Document>> {
    const response = await this.http.request<ClioListResponse<Document>>('/documents.json', { params });
    return toPage(response.data, response.meta);
  }

  async get(id: number, params?: { fields?: string }): Promise<Document> {
    const response = await this.http.request<ClioSingleResponse<Document>>(`/documents/${id}.json`, { params });
    return unwrap<Document>(response);
  }
}
