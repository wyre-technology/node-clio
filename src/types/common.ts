/**
 * Shared envelope/pagination types used across all Clio resources.
 *
 * Confirmed directly against Clio's API reference (https://docs.developers.clio.com/clio-manage/api-reference/)
 * and Pagination doc (https://docs.developers.clio.com/api-docs/clio-manage/paging/):
 * every response is wrapped in a top-level `data` key, and list responses include a
 * `meta.paging` object with `previous`/`next` full URLs when more pages are available.
 *
 * IMPORTANT quirk: if you don't pass a `fields` param, Clio returns only a minimal
 * default field set for most endpoints (typically just `id` and `etag`) -- not the
 * full record. Pass `fields` explicitly (comma-separated; nested resources can be
 * requested with `field{subfield,subfield}` syntax, one level deep) to get anything
 * beyond that. See https://docs.developers.clio.com/api-docs/clio-manage/fields/.
 */

/** Envelope for a single-resource response, e.g. `GET /matters/{id}.json`. */
export interface ClioSingleResponse<T> {
  data: T;
}

/** Envelope for a list response, e.g. `GET /matters.json`. */
export interface ClioListResponse<T> {
  data: T[];
  meta?: ClioListMeta;
}

export interface ClioListMeta {
  paging?: {
    /** Full URL to the next page (pass straight through to `fetch`), omitted on the last page. */
    next?: string;
    /** Full URL to the previous page, when present. */
    previous?: string;
  };
  records?: number;
}

/**
 * Common list-endpoint query parameters supported by (most) Clio resources.
 * Clio's default pagination is cursor-based and requires `order=id(asc)` with no
 * `offset` param to get unlimited results; pass `offset` instead for parallelizable
 * pagination capped at 10,000 total records. See the Pagination doc linked above.
 */
export interface ClioListParams {
  /**
   * Comma-separated field list, e.g. `"id,etag,display_number,status"`. Nested
   * resources: `"id,etag,client{id,name}"`. Omitting this returns only a minimal
   * default field set (usually just `id`/`etag`) for most endpoints -- see the
   * module-level doc comment.
   */
  fields?: string;
  /** Max records per page, 1-200. Clio defaults to 200 if omitted. */
  limit?: number;
  /** Opaque pagination cursor taken from `meta.paging.next`/`previous`. */
  page_token?: string;
  /** Skip this many records (limited/offset pagination, capped at 10,000 total records, unsupported on some endpoints). */
  offset?: number;
  /** Sort order, e.g. `"id(asc)"`. Valid values vary per resource -- see the API reference. Required to be `id(asc)` for unlimited cursor pagination. */
  order?: string;
  /** ISO-8601 timestamp — only return records created at or after this time. */
  created_since?: string;
  /** ISO-8601 timestamp — only return records updated at or after this time. */
  updated_since?: string;
  /**
   * Array-valued params (e.g. `ids`) are serialized as repeated `key[]=value` query
   * entries, matching Clio's documented filter syntax (e.g. `?ids[]=1&ids[]=2`) --
   * see `http.ts`'s `buildUrl`.
   */
  [key: string]: string | number | boolean | undefined | Array<string | number>;
}

/**
 * Standard Clio error envelope. Confirmed from Clio's docs for general errors
 * (e.g. a 403 looks like `{ "error": { "type": "ForbiddenError", "message": "..." } }`
 * -- see https://docs.developers.clio.com/api-docs/clio-manage/permissions/).
 * Field-level 422 validation error shape is not documented with a worked example;
 * `error.fields` and the top-level `errors` hash are both handled defensively
 * (see `http.ts`'s 400/422 handling) since Rails JSON APIs commonly use one or the other.
 */
export interface ClioErrorResponse {
  error?: {
    message?: string;
    type?: string;
    fields?: Record<string, string[]>;
  };
  errors?: Record<string, string[] | string>;
  message?: string;
}
