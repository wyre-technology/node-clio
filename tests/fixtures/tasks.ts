import type { Task } from '../../src/types/tasks.js';

export const sampleTask: Task = {
  id: 4001,
  etag: '"etag-task-4001"',
  name: 'File motion for summary judgment',
  status: 'pending',
  description: 'Prepare and file the motion before the deadline.',
  description_text_type: 'plain_text',
  priority: 'High',
  due_at: '2026-03-01',
  permission: 'public',
  created_at: '2026-02-08T10:00:00Z',
  updated_at: '2026-02-08T10:00:00Z',
  matter: { id: 1001, display_number: 'Smith, Jane - 1001' },
  assignee: { id: 12, type: 'User', name: 'Alex Attorney' },
};

export const taskListResponse = {
  data: [sampleTask],
  meta: { paging: {} },
};

export const taskSingleResponse = { data: sampleTask };
