/**
 * 任务服务层：任务目录（静态）+ 完成状态（后端）
 */
import type { Task } from '@/types';
import { MOCK_ENABLED } from './mock';
import { mockTasks } from './mock/task.mock';
import { callCloudFunction } from './cloud';

// 任务目录（去掉 mock 的 completed 状态）
const TASK_CATALOG: Omit<Task, 'completed'>[] = mockTasks.map(({ completed, ...rest }) => rest);

interface RawTaskRecord {
  taskId: string;
}

export async function fetchTasks(): Promise<Task[]> {
  if (MOCK_ENABLED) return [...mockTasks];

  const records = await callCloudFunction<RawTaskRecord[]>('task', { action: 'list' });
  const done = new Set((records || []).map((r) => r.taskId));
  return TASK_CATALOG.map((t) => ({ ...t, completed: done.has(t.id) }));
}

export async function completeTask(taskId: string, reward: number): Promise<void> {
  if (MOCK_ENABLED) return;
  await callCloudFunction('task', { action: 'complete', data: { taskId, reward } });
}
