import { X } from 'lucide-react';

import { diffSummary } from '../mock';

export interface VersionDiffModalProps {
  open: boolean;
  onClose: () => void;
}

export default function VersionDiffModal({ open, onClose }: VersionDiffModalProps): JSX.Element | null {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40">
      <section className="w-[520px] rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">版本差异对比</h2>
            <p className="mt-1 text-sm text-slate-500">V1.2 与上一版本的用例变化概览。</p>
          </div>
          <button className="rounded-lg border border-[#E5E7EB] p-2 text-slate-500 hover:text-slate-900" type="button" onClick={onClose} aria-label="关闭差异对比">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {diffSummary.map((item) => (
            <div className={`rounded-xl p-4 text-center ${item.tone}`} key={item.label}>
              <div className="text-sm font-semibold">{item.label}</div>
              <div className="mt-2 text-2xl font-bold">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm leading-6 text-slate-600">
          本次变更集中在订单支付、库存回滚、消息补偿 3 个模块，建议优先执行新增高优先级用例。
        </div>
      </section>
    </div>
  );
}
