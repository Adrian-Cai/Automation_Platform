import type { HistoryStatus } from '../types';

const statusStyles: Record<HistoryStatus, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  processing: 'border-orange-200 bg-orange-50 text-orange-700',
  failed: 'border-red-200 bg-red-50 text-red-700',
};

const statusLabels: Record<HistoryStatus, string> = {
  success: '生成成功',
  processing: '生成中',
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
