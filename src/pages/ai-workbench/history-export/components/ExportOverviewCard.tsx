import { FileJson, FileSpreadsheet, FileText } from 'lucide-react';

export interface ExportOverviewCardProps {
  pendingSyncCount: number;
}

export default function ExportOverviewCard({ pendingSyncCount }: ExportOverviewCardProps): JSX.Element {
  const formatItems = [
    { label: 'Excel', icon: FileSpreadsheet },
    { label: 'Markdown', icon: FileText },
    { label: 'JSON', icon: FileJson },
  ];

  return (
    <section className="w-full rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">导出概览</h2>
      <p className="mt-1 text-sm text-slate-500">快速查看当前工作区的导出能力与同步状态。</p>
      <div className="mt-5 space-y-4">
        <div>
          <div className="text-xs font-semibold text-slate-400">可导出格式</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formatItems.map((item) => {
              const Icon = item.icon;
              return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#2563EB]" key={item.label}>
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-[#F8FAFC] p-3">
            <span className="text-slate-500">最近导出</span>
            <div className="mt-1 font-semibold text-slate-900">暂无</div>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] p-3">
            <span className="text-slate-500">待同步记录</span>
            <div className="mt-1 font-semibold text-slate-900">{pendingSyncCount}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
