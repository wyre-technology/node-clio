import type { ClioListParams } from './common.js';
import type { Contact } from './contacts.js';
import type { Matter, UserRef } from './matters.js';

/** Field names verified against https://docs.developers.clio.com/clio-manage/api-reference/#tag/Documents */

export interface DocumentFolderRef {
  id: number;
  etag?: string;
  type?: 'Folder';
  locked?: boolean;
  name?: string;
  root?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface DocumentCategoryRef {
  id: number;
  etag?: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentVersionRef {
  id: number;
  document_id?: number;
  etag?: string;
  uuid?: string;
  filename?: string;
  size?: number;
  version_number?: number;
  content_type?: string;
  received_at?: string;
  fully_uploaded?: boolean;
  creator?: Partial<UserRef>;
  created_at?: string;
  updated_at?: string;
}

/**
 * A Document -- **metadata only**. This SDK deliberately does not implement
 * document content upload/download (`Document#download`, `Document#copy`, and
 * document create/update/destroy all exist in Clio's API but aren't wrapped here)
 * -- see the README's scope limitations. Fields confirmed against the API
 * reference's `Document#show`/`Document#index` response sample.
 */
export interface Document {
  id: number;
  etag?: string;
  type?: 'Document';
  locked?: boolean;
  name?: string;
  received_at?: string;
  filename?: string;
  /** Size in bytes. */
  size?: number;
  content_type?: string;
  parent?: DocumentFolderRef;
  matter?: Partial<Matter>;
  contact?: Partial<Contact>;
  document_category?: DocumentCategoryRef;
  creator?: Partial<UserRef>;
  latest_document_version?: DocumentVersionRef;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface DocumentListParams extends ClioListParams {
  contact_id?: number;
  matter_id?: number;
  document_category_id?: number;
  parent_id?: number;
  locked?: boolean;
  include_deleted?: boolean;
  show_uncompleted?: boolean;
  /** Children of `parent_id` vs. all descendants. Defaults to `'children'`. */
  scope?: 'children' | 'descendants';
  external_property_name?: string;
  external_property_value?: string;
  /** Wildcard search on `name`. */
  query?: string;
  ids?: number[];
}
