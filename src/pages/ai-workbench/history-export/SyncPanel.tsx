import { Loader2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

import StatusTag from './StatusTag';

interface SyncPanelProps {
  isSyncing: boolean;
  onSync: () => void;
}

export default function SyncPanel({ isSyncing, onSync }: SyncPanelProps): JSX.Element {
  return (
    <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/80">
      <h2 className="text-base font-bold text-slate-950">同步到测试平台</h2>
      <p className="mt-1 text-xs text-slate-500">将生成的测试用例同步到测试管理平台</p>
      <select className="mt-4 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-300">
        <option>示例测试平台（TestLink）</option>
      </select>
      <button
        type="button"
        className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        disabled={isSyncing}
        onClick={() => {
          try {
            onSync();
          } catch {
            toast.error('同步失败，请稍后重试');
          }
        }}
      >
        {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
        {isSyncing ? '同步中...' : '同步用例'}
      </button>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>最近同步：2024-05-20 14:25</span>
        <StatusTag status="同步成功" />
      </div>
      <div className="mt-3 text-center">
        <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">查看同步历史</button>
      </div>
    </section>
  );
}
