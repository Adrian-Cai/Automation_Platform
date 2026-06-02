import { Bell, ChevronDown, CircleHelp, Search, Sparkles } from 'lucide-react';

export default function Header(): JSX.Element {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-base font-bold text-slate-950">AI 测试用例生成工作台</span>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-slate-700" type="button">
          示例项目 <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
      </div>
      <div className="mx-8 flex max-w-xl flex-1 items-center rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          className="ml-2 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          placeholder="搜索需求、项目、用例、测试点..."
          type="search"
        />
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-xl border border-[#E5E7EB] p-2 text-slate-500 hover:text-[#2563EB]" type="button" aria-label="通知">
          <Bell className="h-5 w-5" />
        </button>
        <button className="rounded-xl border border-[#E5E7EB] p-2 text-slate-500 hover:text-[#2563EB]" type="button" aria-label="帮助">
          <CircleHelp className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] px-3 py-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-[#2563EB]">张</div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">张伟</div>
            <div className="text-xs text-slate-500">测试工程师</div>
          </div>
        </div>
      </div>
    </header>
  );
}
