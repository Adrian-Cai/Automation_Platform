import { GitCompareArrows } from 'lucide-react';

export interface VersionCompareCardProps {
  onCompare: () => void;
}

export default function VersionCompareCard({ onCompare }: VersionCompareCardProps): JSX.Element {
  const changes = [
    { label: '新增用例', value: '+28', className: 'text-emerald-600' },
    { label: '删除用例', value: '-6', className: 'text-rose-600' },
    { label: '变更模块', value: '3', className: 'text-[#2563EB]' },
  ];

  return (
    <section className="w-full rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">版本对比</h2>
          <p className="mt-1 text-sm text-slate-500">聚合当前版本与上一版本的核心差异。</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
          <GitCompareArrows className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-[#F8FAFC] p-3">
          <span className="text-slate-500">当前版本</span>
          <div className="mt-1 font-semibold text-slate-900">V1.2</div>
        </div>
        <div className="rounded-xl bg-[#F8FAFC] p-3">
          <span className="text-slate-500">上一版本</span>
          <div className="mt-1 font-semibold text-slate-900">V1.1</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {changes.map((item) => (
          <div className="rounded-xl border border-[#E5E7EB] p-3 text-center" key={item.label}>
            <div className={`text-xl font-bold ${item.className}`}>{item.value}</div>
            <div className="mt-1 text-xs text-slate-500">{item.label}</div>
          </div>
        ))}
      </div>
      <button className="mt-5 w-full rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600" type="button" onClick={onCompare}>
        查看版本差异
      </button>
    </section>
  );
}
