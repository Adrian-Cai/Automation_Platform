import type { StatItem } from '../types';

export interface StatCardProps {
  item: StatItem;
}

export default function StatCard({ item }: StatCardProps): JSX.Element {
  const Icon = item.icon;
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{item.value}</p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-sm font-medium text-emerald-600">{item.trend}</p>
    </section>
  );
}
