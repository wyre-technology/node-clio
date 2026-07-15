import type { ClioListParams } from './common.js';
import type { Contact } from './contacts.js';
import type { GroupRef, Matter, UserRef } from './matters.js';

/** Field names verified against https://docs.developers.clio.com/clio-manage/api-reference/#tag/Bills */

export type BillState = 'draft' | 'awaiting_approval' | 'awaiting_payment' | 'paid' | 'void' | 'deleted';

export interface BillDiscountRef {
  rate?: number;
  type?: string;
  note?: string;
  early_payment_rate?: number;
  early_payment_period?: number;
}

export interface BillInterestRef {
  balance?: number;
  period?: number;
  rate?: number;
  total?: number;
  type?: string;
}

/**
 * A Bill (invoice). **Read-only in this SDK** -- billing and trust-accounting
 * mutations touch regulated funds-handling workflows and are out of scope for v1
 * (see the README). Fields confirmed against the API reference's `Bill#show`/
 * `Bill#index` response sample.
 */
export interface Bill {
  id: number;
  etag?: string;
  number?: string;
  issued_at?: string;
  due_at?: string;
  tax_rate?: number;
  secondary_tax_rate?: number;
  subject?: string;
  purchase_order?: string;
  /** e.g. `"MatterBill"`. */
  type?: string;
  memo?: string;
  start_at?: string;
  end_at?: string;
  balance?: number;
  state?: BillState;
  /** e.g. `"revenue_kind"` / `"trust_kind"` -- mirrors the `type` list-filter's `"revenue" | "trust"` values. */
  kind?: string;
  total?: number;
  paid?: number;
  paid_at?: string;
  pending?: number;
  due?: number;
  discount_services_only?: boolean;
  can_update?: boolean;
  credits_issued?: number;
  shared?: boolean;
  last_sent_at?: string;
  services_secondary_tax?: number;
  services_sub_total?: number;
  services_tax?: number;
  services_taxable_sub_total?: number;
  services_secondary_taxable_sub_total?: number;
  taxable_sub_total?: number;
  secondary_taxable_sub_total?: number;
  sub_total?: number;
  tax_sum?: number;
  secondary_tax_sum?: number;
  total_tax?: number;
  available_state_transitions?: string[];
  user?: Partial<UserRef>;
  client?: Partial<Contact>;
  matters?: Array<Partial<Matter>>;
  group?: GroupRef;
  discount?: BillDiscountRef;
  interest?: BillInterestRef;
  created_at?: string;
  updated_at?: string;
}

export interface BillListParams extends ClioListParams {
  bill_number?: string;
  client_id?: number;
  currency_id?: number;
  matter_id?: number;
  originating_attorney_id?: number;
  responsible_attorney_id?: number;
  /** ISO-8601 date. */
  due_at?: string;
  due_after?: string;
  due_before?: string;
  issued_after?: string;
  issued_before?: string;
  last_sent_start_date?: string;
  last_sent_end_date?: string;
  overdue_only?: boolean;
  state?: BillState;
  status?: 'all' | 'overdue';
  /** `"revenue"` or `"trust"` bills. */
  type?: 'revenue' | 'trust';
  /** Wildcard search on invoice number (documented as an integer param, oddly, in the API reference). */
  query?: number;
  ids?: number[];
}
