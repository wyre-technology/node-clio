import { describe, expect, it } from 'vitest';
import { createTestClient } from './helpers.js';
import { sampleTask } from './fixtures/tasks.js';

describe('TasksResource', () => {
  it('list() parses the envelope', async () => {
    const client = createTestClient();
    const page = await client.tasks.list({ matter_id: 1001 });

    expect(page.data).toEqual([sampleTask]);
  });

  it('get() unwraps a single task', async () => {
    const client = createTestClient();
    const task = await client.tasks.get(4001);

    expect(task).toEqual(sampleTask);
    expect(task.priority).toBe('High');
  });

  it('create() posts and unwraps the created task', async () => {
    const client = createTestClient();
    const task = await client.tasks.create({
      assignee: { id: 12, type: 'User' },
      description: 'Prepare and file the motion before the deadline.',
      name: 'File motion for summary judgment',
    });

    expect(task).toEqual(sampleTask);
  });

  it('update() patches and unwraps the updated task', async () => {
    const client = createTestClient();
    const task = await client.tasks.update(4001, { status: 'complete' });

    expect(task).toEqual(sampleTask);
  });
});
