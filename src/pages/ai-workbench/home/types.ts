import type { LucideIcon } from 'lucide-react';

export interface StatItem {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  iconClassName: string;
}

export interface QuickStartStep {
  title: string;
  description: string;
  icon: LucideIcon;
}

export type ProjectStatus = '已完成' | '解析完成' | '用例生成中' | '测试点生成中';

export interface RecentProject {
  projectName: string;
  requirementName: string;
  status: ProjectStatus;
  updatedAt: string;
}

export interface CapabilityItem {
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
  iconWrapClassName: string;
}
