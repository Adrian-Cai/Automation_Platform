import { ChevronRight, Info } from 'lucide-react';
import { useLocation } from 'wouter';

const legendItems = [
  { label: '已覆盖', value: '312 (78%)', dotClassName: 'bg-[#2563EB]' },
  { label: '部分覆盖', value: '62 (15%)', dotClassName: 'bg-[#14B8A6]' },
  { label: '未覆盖', value: '26 (7%)', dotClassName: 'bg-[#FB6B4B]' },
];

export default function CoverageOverviewCard(): JSX.Element {
  const [, navigate] = useLocation();

  const handleViewCoverage = (): void => {
    navigate('/ai-workbench/quality-check');
  };

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-[#111827]">需求覆盖概览</h2>
          <Info className="h-4 w-4 text-[#9CA3AF]" />
        </div>
        <span className="text-sm text-[#6B7280]">本项目覆盖率</span>
      </div>

      <div className="mt-7 flex items-center gap-7">
        <div className="relative flex h-[168px] w-[168px] shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#2563EB_0deg_281deg,#14B8A6_281deg_335deg,#FB6B4B_335deg_360deg)]">
          <div className="flex h-[116px] w-[116px] flex-col items-center justify-center rounded-full bg-white shadow-inner">
            <div className="text-[28px] font-bold leading-8 text-[#111827]">78%</div>
            <div className="mt-1 text-xs text-[#6B7280]">总体覆盖率</div>
          </div>
        </div>
        <div className="flex-1 space-y-5">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 text-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${item.dotClassName}`} />
              <span className="flex-1 text-[#374151]">{item.label}</span>
              <span className="font-medium text-[#111827]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-b border-[#E5E7EB] pb-5 text-sm">
        <span className="text-[#374151]">需求总数：<span className="font-semibold text-[#111827]">400</span></span>
        <span className="text-[#6B7280]">更新时间：2024-05-20 14:30</span>
      </div>

      <button type="button" aria-label="跳转到质量检查" onClick={handleViewCoverage} className="mx-auto mt-4 flex cursor-pointer items-center gap-1 text-sm font-medium text-[#2563EB] transition hover:text-[#1D4ED8] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
        查看覆盖率详情 <ChevronRight className="h-4 w-4" />
      </button>
    </section>
  );
}
