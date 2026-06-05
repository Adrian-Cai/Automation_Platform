import { useState } from 'react';
import { Bell, Briefcase, ChevronDown, HelpCircle, Search } from 'lucide-react';

export default function Header(): JSX.Element {
  const [keyword, setKeyword] = useState('');

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-[#E5E7EB] bg-white px-6">
      <div className="flex w-[260px] items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#14B8A6] via-[#2563EB] to-[#4F46E5] text-xl font-extrabold text-white shadow-sm shadow-blue-200">
          A
        </div>
        <div className="text-[18px] font-bold text-[#111827]">AI 测试用例生成工作台</div>
      </div>

      <div className="ml-7 flex flex-1 items-center justify-center gap-6">
        <button
          type="button"
          className="flex h-10 w-[190px] items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] shadow-sm transition hover:border-blue-200"
        >
          <span className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-[#2563EB]" />
            示例项目
          </span>
          <ChevronDown className="h-4 w-4 text-[#6B7280]" />
        </button>

        <div className="relative w-full max-w-[520px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索需求、项目、用例、测试点..."
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-11 pr-16 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-[#E5E7EB] bg-[#F8FAFC] px-2 py-0.5 text-xs font-medium text-[#6B7280]">
            ⌘ K
          </span>
        </div>
      </div>

      <div className="ml-8 flex items-center gap-4">
        <button type="button" className="relative rounded-full p-2 text-[#111827] transition hover:bg-slate-50">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">3</span>
        </button>
        <button type="button" className="rounded-full p-2 text-[#111827] transition hover:bg-slate-50">
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className="h-6 w-px bg-[#E5E7EB]" />
        <button type="button" className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50">
          <div className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-400">
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">张</div>
          </div>
          <div className="text-left leading-tight">
            <div className="text-sm font-semibold text-[#111827]">张伟</div>
            <div className="text-xs text-[#6B7280]">测试工程师</div>
          </div>
          <ChevronDown className="h-4 w-4 text-[#6B7280]" />
        </button>
      </div>
    </header>
  );
}
