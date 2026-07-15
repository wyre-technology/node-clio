import type { Document } from '../../src/types/documents.js';

export const sampleDocument: Document = {
  id: 5001,
  etag: '"etag-document-5001"',
  type: 'Document',
  locked: false,
  name: 'Settlement Demand Letter.pdf',
  filename: 'settlement-demand-letter.pdf',
  size: 204800,
  content_type: 'application/pdf',
  matter: { id: 1001, display_number: 'Smith, Jane - 1001' },
  document_category: { id: 9, name: 'Correspondence' },
  created_at: '2026-02-05T16:30:00Z',
  updated_at: '2026-02-05T16:30:00Z',
};

export const documentListResponse = {
  data: [sampleDocument],
  meta: { paging: {} },
};

export const documentSingleResponse = { data: sampleDocument };
