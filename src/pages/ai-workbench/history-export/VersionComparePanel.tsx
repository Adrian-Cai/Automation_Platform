import type { VersionRecord } from './types';

interface VersionComparePanelProps {
  versions: VersionRecord[];
  onRestoreVersion: (version: string) => void;
  onOpenDiff: () => void;
}

export default function VersionComparePanel({ versions, onRestoreVersion, onOpenDiff }: VersionComparePanelProps): JSX.Element {
  return (
    <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/80">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-950">版本对比</h2>
        <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-700">查看全部版本</button>
      </div>
      <div className="relative space-y-3 pl-5 before:absolute before:left-[6px] before:top-5 before:h-[calc(100%-48px)] before:w-px before:bg-slate-200">
        {versions.map((version) => (
          <article key={version.version} className={`relative rounded-lg border bg-white p-4 shadow-sm ${version.isCurrent ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200'}`}>
            <span className={`absolute -left-[25px] top-5 h-3 w-3 rounded-full border-2 ${version.isCurrent ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`} />
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-950">{version.version}</h3>
                {version.isCurrent ? <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">当前版本</span> : null}
              </div>
              <span className="whitespace-nowrap text-xs text-slate-400">{version.time}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-slate-500">新增用例</p>
                <p className="mt-1 text-base font-bold text-emerald-600">+{version.addedCases}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">删除用例</p>
                <p className="mt-1 text-base font-bold text-red-500">-{version.deletedCases}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">变更模块</p>
                <p className="mt-1 text-base font-bold text-orange-500">{version.changedModules}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" className="h-8 flex-1 rounded-md border border-slate-200 text-xs font-semibold text-blue-600 hover:bg-blue-50">查看详情</button>
              {version.version !== 'V1.0' ? (
                <button
                  type="button"
                  className="h-8 flex-1 rounded-md border border-blue-100 bg-blue-50 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                  onClick={() => onRestoreVersion(version.version)}
                >
                  恢复版本
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <button
        type="button"
        className="mt-4 h-10 w-full rounded-lg border border-blue-100 bg-white text-sm font-semibold text-blue-600 hover:bg-blue-50"
        onClick={onOpenDiff}
      >
        ↔ 对比版本差异
      </button>
    </section>
  );
}
