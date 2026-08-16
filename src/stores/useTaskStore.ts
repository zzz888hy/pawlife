import { create } from 'zustand';
import type { Task } from '@/types';
import { fetchTasks as fetchTasksApi, completeTask as completeTaskApi } from '@/services/task';
import { useUserStore } from './useUserStore';

interface TaskState {
  tasks: Task[];
  fetchTasks: () => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],

  fetchTasks: async () => {
    const tasks = await fetchTasksApi();
    set({ tasks });
  },

  completeTask: async (taskId: string) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task || task.completed) return;

    // 本地乐观标记
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, completed: true } : t)),
    }));

    // 后端同步（真实模式）
    completeTaskApi(taskId, task.reward).catch(() => {});

    // 加金币
    useUserStore.getState().addCoins(task.reward);
  },
}));
