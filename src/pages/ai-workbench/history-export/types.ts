import type { LucideIcon } from 'lucide-react';

export type TabKey = 'generation' | 'versions' | 'exports';
export type HistoryStatus = '已完成' | '部分完成' | '生成失败';
export type ExportFormat = 'Excel' | 'Markdown' | 'JSON' | 'PDF';

export interface StatItem {
  title: string;
  value: string;
  trend?: string;
  description?: string;
  icon: LucideIcon;
  iconClassName: string;
}

export interface HistoryRecord {
  id: string;
  time: string;
  projectName: string;
  requirementName: string;
  content: string;
  caseCount: number;
  status: HistoryStatus;
}

export interface VersionRecord {
  version: string;
  isCurrent?: boolean;
  time: string;
  addedCases: number;
  deletedCases: number;
  changedModules: number;
}

export interface ExportOption {
  format: ExportFormat;
  description: string;
  buttonLabel: string;
  icon: LucideIcon;
  iconClassName: string;
  iconBgClassName: string;
}

export interface RecentExportRecord {
  id: string;
  fileName: string;
  format: ExportFormat;
  caseCount: number;
  time: string;
  creator: string;
}
