import type { StatItem } from '@/pages/ai-workbench/home/types';

interface StatCardProps {
  item: StatItem;
}

export default function StatCard({ item }: StatCardProps): JSX.Element {
  const Icon = item.icon;

  return (
    <article className="flex min-h-[106px] items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.iconClassName}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-[#374151]">{item.title}</div>
        <div className="mt-1 text-[28px] font-bold leading-8 tracking-[-0.02em] text-[#111827]">{item.value}</div>
        <div className="mt-2 text-xs text-[#6B7280]"><span className="font-medium text-[#10B981]">{item.trend.split(' ')[0]} {item.trend.split(' ')[1]}</span> 较上周</div>
      </div>
    </article>
  );
}
