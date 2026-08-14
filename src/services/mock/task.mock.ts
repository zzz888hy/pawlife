import type { Task } from '@/types';

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    icon: '🍽️',
    name: '记录喂食',
    reward: 5,
    rewardText: '+5 金币',
    completed: false,
  },
  {
    id: 'task-2',
    icon: '🚶',
    name: '记录散步',
    reward: 5,
    rewardText: '+5 金币',
    completed: false,
  },
  {
    id: 'task-3',
    icon: '📸',
    name: '上传今日照片',
    reward: 10,
    rewardText: '+10 金币',
    completed: false,
  },
];
