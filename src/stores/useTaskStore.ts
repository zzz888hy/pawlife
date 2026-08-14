import { create } from 'zustand';
import type { Task } from '@/types';
import { mockTasks } from '@/services/mock/task.mock';
import { useUserStore } from './useUserStore';

interface TaskState {
  tasks: Task[];
  fetchTasks: () => void;
  completeTask: (taskId: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],

  fetchTasks: () => {
    setTimeout(() => set({ tasks: mockTasks }), 100);
  },

  completeTask: (taskId: string) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: true } : t
      ),
    }));
    const task = mockTasks.find((t) => t.id === taskId);
    if (task) {
      useUserStore.getState().addCoins(task.reward);
    }
  },
}));
