import type { StatItem } from './types';

interface StatCardProps {
  item: StatItem;
}

export default function StatCard({ item }: StatCardProps): JSX.Element {
  const Icon = item.icon;
  return (
    <section className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/80">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${item.iconClassName}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-500">{item.title}</p>
        <p className="mt-1 truncate text-[22px] font-bold leading-7 tracking-tight text-slate-950">{item.value}</p>
        {item.trend ? <p className="mt-1 text-xs font-medium text-emerald-600">{item.trend}</p> : null}
        {item.description ? <p className="mt-1 text-xs text-slate-500">{item.description}</p> : null}
      </div>
    </section>
  );
}
