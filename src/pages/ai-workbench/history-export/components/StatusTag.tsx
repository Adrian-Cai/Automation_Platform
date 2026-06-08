import type { HistoryStatus } from '../types';

const statusStyles: Record<HistoryStatus, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  draft: 'border-slate-200 bg-slate-50 text-slate-600',
  failed: 'border-red-200 bg-red-50 text-red-700',
};

const statusLabels: Record<HistoryStatus, string> = {
  success: '生成成功',
  draft: '草稿',
  failed: '生成失败',
};

export interface StatusTagProps {
  status: HistoryStatus;
}

export default function StatusTag({ status }: StatusTagProps): JSX.Element {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
