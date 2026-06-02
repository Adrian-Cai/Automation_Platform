import { Bell, BriefcaseBusiness, ChevronDown, CircleHelp, Search } from 'lucide-react';

export default function Header(): JSX.Element {
  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm shadow-slate-200/40">
      <div className="flex min-w-[280px] items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-700 text-white shadow-md shadow-blue-200">
          <span className="text-2xl font-black leading-none">A</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-950">AI 测试用例生成工作台</span>
      </div>

      <button type="button" className="ml-8 flex h-10 w-[210px] items-center justify-between rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50/40">
        <span className="flex items-center gap-2">
          <BriefcaseBusiness className="h-4 w-4 text-blue-600" />
          示例项目
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      <div className="mx-8 max-w-[520px] flex-1">
        <div className="flex h-10 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            className="h-full flex-1 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="搜索需求、项目、用例、测试点..."
            type="search"
          />
          <span className="rounded-md border border-slate-200 px-1.5 py-0.5 text-xs text-slate-400">⌘ K</span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button type="button" className="relative rounded-full p-2 text-slate-700 hover:bg-slate-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">8</span>
        </button>
        <button type="button" className="rounded-full p-2 text-slate-700 hover:bg-slate-100">
          <CircleHelp className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-sm font-bold text-slate-800 ring-2 ring-white">
            张
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">张伟</div>
            <div className="text-xs text-slate-500">测试工程师</div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
