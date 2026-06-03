import type { LucideIcon } from 'lucide-react';

export type HistoryStatus = 'success' | 'processing' | 'failed';
export type WorkspaceTab = 'history' | 'versions' | 'exports';
export type ExportFormat = 'Excel' | 'Markdown' | 'JSON' | 'PDF';

export interface HistoryRecord {
  id: string;
  time: string;
  projectName: string;
  requirementName: string;
  generatedContent: string;
  caseCount: number;
  status: HistoryStatus;
  owner: string;
  duration: string;
  coverage: string;
  requirement?: string;
  createdAt?: string;
  updatedAt?: string;
  syncMode?: string;
}

export interface VersionRecord {
  id: string;
  version: string;
  title: string;
  time: string;
  author: string;
  summary: string;
  isCurrent: boolean;
}

export interface ExportFormatOption {
  format: ExportFormat;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface RecentExport {
  id: string;
  fileName: string;
  format: ExportFormat;
  time: string;
  size: string;
  status: '完成' | '处理中';
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
}
