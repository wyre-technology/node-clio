import type { ClioListMeta } from './types/common.js';

/**
 * A paginated list result: the page of items plus enough information to fetch
 * the next page (if any).
 */
export interface Page<T> {
  data: T[];
  meta?: ClioListMeta;
  /** True when `meta.paging.next` was present on the response. */
  hasMore: boolean;
  /** The full `next` URL from `meta.paging`, if present. Pass to `nextPageToken` helpers. */
  nextUrl?: string;
}

/** Builds a {@link Page} from a raw Clio list envelope. */
export function toPage<T>(data: T[], meta?: ClioListMeta): Page<T> {
  const nextUrl = meta?.paging?.next;
  return {
    data,
    meta,
    hasMore: Boolean(nextUrl),
    nextUrl,
  };
}

/**
 * Extracts the opaque `page_token` query parameter from a Clio `next` pagination
 * URL so it can be passed back into a subsequent `list()` call, without callers
 * having to parse Clio's URL structure themselves.
 */
export function extractPageToken(nextUrl: string | undefined): string | undefined {
  if (!nextUrl) return undefined;
  try {
    const url = new URL(nextUrl);
    return url.searchParams.get('page_token') ?? undefined;
  } catch {
    return undefined;
  }
}
