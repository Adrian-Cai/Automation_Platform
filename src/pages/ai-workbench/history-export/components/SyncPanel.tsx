import { Loader2, RefreshCw } from 'lucide-react';

export interface SyncPanelProps {
  isSyncing: boolean;
  onSync: () => void;
}

export default function SyncPanel({ isSyncing, onSync }: SyncPanelProps): JSX.Element {
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">同步用例</h2>
          <p className="mt-1 text-sm text-slate-500">将已确认用例同步到测试管理平台，并保留同步日志。</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70" disabled={isSyncing} type="button" onClick={onSync}>
          {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {isSyncing ? '同步中...' : '同步用例'}
        </button>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl bg-[#F8FAFC] p-3"><span className="text-slate-500">目标空间</span><div className="mt-1 font-semibold text-slate-900">示例项目 / AI Case Space</div></div>
        <div className="rounded-xl bg-[#F8FAFC] p-3"><span className="text-slate-500">待同步</span><div className="mt-1 font-semibold text-slate-900">128 条用例</div></div>
        <div className="rounded-xl bg-[#F8FAFC] p-3"><span className="text-slate-500">最近同步</span><div className="mt-1 font-semibold text-slate-900">2026-06-01 17:45</div></div>
      </div>
    </section>
  );
}
