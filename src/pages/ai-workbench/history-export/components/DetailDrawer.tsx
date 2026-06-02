import { X } from 'lucide-react';

import type { HistoryRecord } from '../types';
import StatusTag from './StatusTag';

export interface DetailDrawerProps {
  record: HistoryRecord | null;
  onClose: () => void;
}

export default function DetailDrawer({ record, onClose }: DetailDrawerProps): JSX.Element | null {
  if (!record) {
    return null;
  }

  const detailRows = [
    { label: '记录编号', value: record.id },
    { label: '生成时间', value: record.time },
    { label: '项目名称', value: record.projectName },
    { label: '需求名称', value: record.requirementName },
    { label: '生成内容', value: record.generatedContent },
    { label: '用例数量', value: `${record.caseCount} 条` },
    { label: '负责人', value: record.owner },
    { label: '生成耗时', value: record.duration },
    { label: '覆盖率', value: record.coverage },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30">
      <aside className="h-full w-[440px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">历史记录详情</h2>
            <p className="mt-1 text-sm text-slate-500">查看当前记录的生成参数、结果与状态。</p>
          </div>
          <button className="rounded-lg border border-[#E5E7EB] p-2 text-slate-500 hover:text-slate-900" type="button" onClick={onClose} aria-label="关闭详情">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 space-y-3">
          {detailRows.map((row) => (
            <div className="rounded-xl border border-[#E5E7EB] p-3" key={row.label}>
              <div className="text-xs font-semibold text-slate-400">{row.label}</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{row.value}</div>
            </div>
          ))}
          <div className="rounded-xl border border-[#E5E7EB] p-3">
            <div className="text-xs font-semibold text-slate-400">状态</div>
            <div className="mt-2"><StatusTag status={record.status} /></div>
          </div>
        </div>
      </aside>
    </div>
  );
}
