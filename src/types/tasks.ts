import type { ClioListParams } from './common.js';
import type { Matter } from './matters.js';

/** Field names verified against https://docs.developers.clio.com/clio-manage/api-reference/#tag/Tasks */

/**
 * Confirmed lowercase in both the `Task#index` filter enum and the request/response
 * `status` field.
 */
export type TaskStatus = 'pending' | 'in_progress' | 'in_review' | 'complete' | 'draft';

/**
 * Confirmed capitalized in the `Task#create`/`#update` request body enum and the
 * response sample (`"priority": "High"`). Note this differs in casing from the
 * `Task#index` `priority` *filter* param, which is documented lowercase
 * (`"high" | "normal" | "low"`) -- see {@link TaskListParams.priority}.
 */
export type TaskPriority = 'High' | 'Normal' | 'Low';

export type TaskPermission = 'private' | 'public';

export interface TaskTypeRef {
  id: number;
  etag?: string;
  name?: string;
  deleted_at?: string;
}

/**
 * A Task. Fields confirmed against the API reference's `Task#show`/`Task#index`/
 * `Task#create` response samples.
 */
export interface Task {
  id: number;
  etag?: string;
  name?: string;
  status?: TaskStatus;
  description?: string;
  description_text_type?: 'plain_text' | 'rich_text';
  priority?: TaskPriority;
  due_at?: string;
  permission?: TaskPermission;
  completed_at?: string;
  notify_completion?: boolean;
  statute_of_limitations?: boolean;
  time_estimated?: number;
  created_at?: string;
  updated_at?: string;
  time_entries_count?: number;
  task_type?: TaskTypeRef;
  matter?: Partial<Matter>;
  assignee?: { id: number; type?: 'User' | 'Contact'; name?: string };
}

export interface TaskListParams extends ClioListParams {
  assignee_id?: number;
  /** Must be passed alongside `assignee_id`. */
  assignee_type?: 'user' | 'contact';
  assigner_id?: number;
  cascading_source_id?: number;
  client_id?: number;
  complete?: boolean;
  matter_id?: number;
  /** ISO-8601 date. */
  due_at_from?: string;
  /** ISO-8601 date. */
  due_at_to?: string;
  due_at_present?: boolean;
  permission?: TaskPermission;
  /** Lowercase in the list filter -- see the {@link TaskPriority} doc comment re: casing. */
  priority?: 'high' | 'normal' | 'low';
  /** Wildcard search across `name`/`description`. */
  query?: string;
  responsible_attorney_id?: number;
  status?: TaskStatus;
  statuses?: TaskStatus[];
  statute_of_limitations?: boolean;
  task_type_id?: number;
  time_entries_present?: boolean;
  ids?: number[];
}

/** Request body for `POST /tasks.json`. `assignee`, `description`, and `name` are required by Clio. */
export interface TaskCreateData {
  assignee: { id: number; type: 'User' | 'Contact' };
  description: string;
  name: string;
  matter?: { id: number };
  due_at?: string;
  description_text_type?: 'plain_text' | 'rich_text';
  notify_assignee?: boolean;
  notify_completion?: boolean;
  /** Defaults to `'public'`. */
  permission?: TaskPermission;
  /** Defaults to `'Normal'`. */
  priority?: TaskPriority;
  /** Defaults to `'pending'`. */
  status?: TaskStatus;
  statute_of_limitations?: boolean;
  task_type?: { id: number };
  time_estimated?: number;
  cascading?: boolean;
  cascading_offset?: number;
  cascading_offset_polarity?: 'CalendarDays' | 'CalendarWeeks' | 'CalendarMonths' | 'CalendarYears' | 'BusinessDays';
  cascading_offset_type?: 'Before' | 'After';
  cascading_source?: number;
  [key: string]: unknown;
}

/** Request body for `PATCH /tasks/{id}.json`. All fields optional. */
export type TaskUpdateData = Partial<TaskCreateData>;
