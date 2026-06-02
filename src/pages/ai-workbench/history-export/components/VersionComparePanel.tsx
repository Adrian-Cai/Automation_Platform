import { RotateCcw } from 'lucide-react';

import type { VersionRecord } from '../types';

export interface VersionComparePanelProps {
  versions: VersionRecord[];
  onCompare: () => void;
  onRestore: (version: VersionRecord) => void;
}

export default function VersionComparePanel({ versions, onCompare, onRestore }: VersionComparePanelProps): JSX.Element {
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">版本记录</h2>
          <p className="mt-1 text-sm text-slate-500">以时间线方式追踪最近 3 条版本记录与差异摘要。</p>
        </div>
        <button className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm" type="button" onClick={onCompare}>
          对比版本差异
        </button>
      </div>
      <div className="relative space-y-4 before:absolute before:bottom-6 before:left-5 before:top-6 before:w-px before:bg-[#E5E7EB]">
        {versions.map((version) => (
          <article className={`relative ml-2 rounded-xl border bg-white p-4 pl-8 ${version.isCurrent ? 'border-[#2563EB] shadow-sm shadow-blue-100' : 'border-[#E5E7EB]'}`} key={version.id}>
            <span className={`absolute -left-0.5 top-5 h-3 w-3 rounded-full ring-4 ${version.isCurrent ? 'bg-[#2563EB] ring-blue-100' : 'bg-slate-300 ring-white'}`} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-950">{version.version} · {version.title}</h3>
                  {version.isCurrent ? <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-[#2563EB]">当前版本</span> : null}
                </div>
                <p className="mt-2 text-sm text-slate-600">{version.summary}</p>
                <p className="mt-3 text-xs text-slate-400">{version.time} · {version.author}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-[#2563EB]" type="button">
                  查看详情
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-600" type="button" onClick={() => onRestore(version)}>
                  <RotateCcw className="h-4 w-4" />恢复版本
                </button>
                <button className="rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-semibold text-white" type="button" onClick={onCompare}>
                  对比版本差异
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
