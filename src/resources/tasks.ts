import type { HttpClient } from '../http.js';
import { unwrap } from '../http.js';
import { toPage, type Page } from '../pagination.js';
import type { ClioListResponse, ClioSingleResponse } from '../types/common.js';
import type { Task, TaskCreateData, TaskListParams, TaskUpdateData } from '../types/tasks.js';

/**
 * Tasks. Endpoints confirmed against
 * https://docs.developers.clio.com/clio-manage/api-reference/#tag/Tasks
 */
export class TasksResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: TaskListParams): Promise<Page<Task>> {
    const response = await this.http.request<ClioListResponse<Task>>('/tasks.json', { params });
    return toPage(response.data, response.meta);
  }

  async get(id: number, params?: { fields?: string }): Promise<Task> {
    const response = await this.http.request<ClioSingleResponse<Task>>(`/tasks/${id}.json`, { params });
    return unwrap<Task>(response);
  }

  async create(data: TaskCreateData, params?: { fields?: string }): Promise<Task> {
    const response = await this.http.request<ClioSingleResponse<Task>>('/tasks.json', {
      method: 'POST',
      params,
      body: { data },
    });
    return unwrap<Task>(response);
  }

  async update(id: number, data: TaskUpdateData, params?: { fields?: string }): Promise<Task> {
    const response = await this.http.request<ClioSingleResponse<Task>>(`/tasks/${id}.json`, {
      method: 'PATCH',
      params,
      body: { data },
    });
    return unwrap<Task>(response);
  }
}
