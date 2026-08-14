export interface Task {
  id: string;
  icon: string;
  name: string;
  reward: number;
  rewardText: string;
  completed: boolean;
}

export type VipPlan = 'monthly' | 'yearly';

export interface VipPlanInfo {
  type: VipPlan;
  name: string;
  price: number;
  unit: string;
  perDay: string;
  tag?: string;
}

export interface VipBenefit {
  icon: string;
  title: string;
  desc: string;
}
