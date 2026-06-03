import type { HistoryStatus } from './types';

interface StatusTagProps {
  status: HistoryStatus | '同步成功';
}

const statusClassNames: Record<HistoryStatus | '同步成功', string> = {
  已完成: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  部分完成: 'border-orange-200 bg-orange-50 text-orange-700',
  生成失败: 'border-red-200 bg-red-50 text-red-700',
  同步成功: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export default function StatusTag({ status }: StatusTagProps): JSX.Element {
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${statusClassNames[status]}`}>
      {status}
    </span>
  );
}
