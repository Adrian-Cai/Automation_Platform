import { Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { ExportFormat, RecentExportRecord } from './types';

interface RecentExportListProps {
  records: RecentExportRecord[];
}

const formatIconClassNames: Record<ExportFormat, string> = {
  Excel: 'bg-emerald-50 text-emerald-600',
  Markdown: 'bg-slate-100 text-slate-600',
  JSON: 'bg-violet-50 text-violet-600',
  PDF: 'bg-red-50 text-red-600',
};

const formatIcons: Record<ExportFormat, LucideIcon> = {
  Excel: FileSpreadsheet,
  Markdown: FileText,
  JSON: FileJson,
  PDF: FileText,
};

export default function RecentExportList({ records }: RecentExportListProps): JSX.Element {
  return (
    <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/80">
      <h2 className="text-base font-bold text-slate-950">最近导出记录</h2>
      <div className="mt-4 space-y-3">
        {records.map((record) => {
          const Icon = formatIcons[record.format];
          return (
            <div key={record.id} className="grid grid-cols-[1fr_136px_52px] items-center gap-3 rounded-lg border border-transparent p-1.5 hover:border-slate-100 hover:bg-slate-50">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${formatIconClassNames[record.format]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{record.fileName}</p>
                  <p className="text-xs text-slate-500">{record.format} · {record.caseCount} 条用例</p>
                </div>
              </div>
              <div className="text-xs leading-5 text-slate-500">
                <p>{record.time}</p>
                <p>{record.creator}</p>
              </div>
              <button type="button" className="flex items-center justify-end gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                <Download className="h-3.5 w-3.5" />下载
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-4 border-t border-slate-100 pt-3 text-center">
        <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">查看全部导出记录</button>
      </div>
    </section>
  );
}
