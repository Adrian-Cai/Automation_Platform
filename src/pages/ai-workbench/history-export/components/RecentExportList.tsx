import { Download } from 'lucide-react';

import type { RecentExport } from '../types';

export interface RecentExportListProps {
  exports: RecentExport[];
}

export default function RecentExportList({ exports }: RecentExportListProps): JSX.Element {
  return (
    <section className="w-full rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">最近导出记录</h2>
      <div className="mt-4 space-y-3">
        {exports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E5E7EB] py-8 text-center text-sm text-slate-500">暂无导出记录</div>
        ) : null}
        {exports.map((item) => (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-[#E5E7EB] p-3" key={item.id}>
            <div className="min-w-0">
              <div className="truncate font-semibold text-slate-900" title={item.fileName}>{item.fileName}</div>
              <div className="mt-1 text-xs text-slate-500">{item.format} · {item.time} · {item.size}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === '完成' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>{item.status}</span>
              <button className="rounded-lg border border-[#E5E7EB] p-2 text-slate-500 hover:text-[#2563EB]" type="button" aria-label={`下载 ${item.fileName}`}>
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
