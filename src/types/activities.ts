import type { ClioListParams } from './common.js';
import type { CurrencyRef, Matter } from './matters.js';

/** Field names verified against https://docs.developers.clio.com/clio-manage/api-reference/#tag/Activities */

/** Time entries (`TimeEntry`) and expense entries (`ExpenseEntry`/`HardCostEntry`/`SoftCostEntry`) logged against a matter. */
export type ActivityType = 'TimeEntry' | 'ExpenseEntry' | 'HardCostEntry' | 'SoftCostEntry';

export type ActivityTaxSetting = 'no_tax' | 'tax_1_only' | 'tax_2_only' | 'tax_1_and_tax_2';

export interface TaxSettingEntry {
  tax_rate_configuration_id?: number;
  tax_rate_configuration_name?: string;
  tax_rate_configuration_rate?: number;
  tax_rate_configuration_formatted_rate?: string;
  order?: number;
  rule?: string;
}

export interface ActivityDescriptionRef {
  id: number;
  etag?: string;
  name?: string;
  visible_to_co_counsel?: boolean;
  default?: boolean;
  type?: string;
  utbms_activity_id?: number;
  utbms_task_name?: string;
  utbms_task_id?: number;
  xero_service_code?: string;
  accessible_to_user?: boolean;
  category_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseCategoryRef {
  id: number;
  etag?: string;
  name?: string;
  rate?: number;
  entry_type?: string;
  xero_expense_code?: string;
  accessible_to_user?: boolean;
  tax_setting?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * An Activity: a time entry or expense entry logged against a matter. Fields
 * confirmed against the API reference's `Activity#show`/`Activity#index` response
 * sample. `quantity` is documented as hours for a TimeEntry on API versions
 * <= 4.0.3 and as *seconds* on the latest version -- check `X-API-VERSION`
 * behavior if precision matters for your integration.
 */
export interface Activity {
  id: number;
  etag?: string;
  type?: ActivityType;
  date?: string;
  quantity_in_hours?: number;
  rounded_quantity_in_hours?: number;
  quantity?: number;
  rounded_quantity?: number;
  quantity_redacted?: boolean;
  /** Hourly/flat rate for a TimeEntry; the expense amount for an ExpenseEntry/HardCostEntry/SoftCostEntry. */
  price?: number;
  note?: string;
  flat_rate?: boolean;
  billed?: boolean;
  on_bill?: boolean;
  total?: number;
  contingency_fee?: boolean;
  created_at?: string;
  updated_at?: string;
  /** A check reference, for a HardCostEntry. */
  reference?: string;
  non_billable?: boolean;
  non_billable_total?: number;
  no_charge?: boolean;
  tax_setting?: ActivityTaxSetting;
  tax_settings?: TaxSettingEntry[];
  input_tax_settings?: TaxSettingEntry[];
  currency?: CurrencyRef;
  activity_description?: ActivityDescriptionRef;
  expense_category?: ExpenseCategoryRef;
  matter?: Partial<Matter>;
}

export interface ActivityListParams extends ClioListParams {
  activity_description_id?: number;
  calendar_entry_id?: number;
  communication_id?: number;
  contact_note_id?: number;
  expense_category_id?: number;
  flat_rate?: boolean;
  grant_id?: number;
  matter_id?: number;
  matter_note_id?: number;
  only_unaccounted_for?: boolean;
  /** Wildcard search on the `note` field. */
  query?: string;
  /** ISO-8601 date -- activities whose `date` is on or after this. */
  start_date?: string;
  /** ISO-8601 date -- activities whose `date` is on or before this. */
  end_date?: string;
  status?: 'billed' | 'draft' | 'unbilled' | 'non_billable' | 'billable' | 'written_off';
  task_id?: number;
  type?: ActivityType;
  user_id?: number;
  ids?: number[];
}

/** Request body for `POST /activities.json`. `date` and `type` are required by Clio. */
export interface ActivityCreateData {
  date: string;
  type: ActivityType;
  matter?: { id: number };
  activity_description?: { id: number; utbms_task_id?: number; utbms_activity_id?: number };
  expense_category?: { id: number };
  user?: { id: number };
  vendor?: { id: number };
  task?: { id: number };
  calendar_entry?: { id: number };
  communication?: { id: number };
  contact_note?: { id: number };
  matter_note?: { id: number };
  note?: string;
  /** TimeEntry: hourly/flat rate. ExpenseEntry/HardCostEntry/SoftCostEntry: the expense amount. */
  price?: number;
  /** TimeEntry: duration (seconds on the latest API version). ExpenseEntry/SoftCostEntry: quantity. */
  quantity?: number;
  reference?: string;
  no_charge?: boolean;
  non_billable?: boolean;
  /** Starts a timer for this Activity. Only valid for non-FlatRate, non-billed TimeEntries. */
  start_timer?: boolean;
  tax_setting?: ActivityTaxSetting;
  tax_settings?: Array<{ tax_rate_configuration_id: number; order?: number; rule?: string }>;
  input_tax_settings?: Array<{ tax_rate_configuration_id: number; order?: number; rule?: string }>;
  [key: string]: unknown;
}
