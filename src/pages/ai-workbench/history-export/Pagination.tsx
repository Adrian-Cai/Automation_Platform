import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination(): JSX.Element {
  const pages = ['1', '2', '3', '4', '5', '...', '25'];
  return (
    <div className="flex h-16 items-center justify-between border-t border-slate-100 px-5 text-sm text-slate-600">
      <span>共 248 条</span>
      <div className="flex items-center gap-2">
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-blue-200 hover:text-blue-600">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={`h-8 min-w-8 rounded-md px-2 text-sm font-medium ${page === '1' ? 'border border-blue-600 bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            {page}
          </button>
        ))}
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-600">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-300">
          <option>10 条 / 页</option>
          <option>20 条 / 页</option>
          <option>50 条 / 页</option>
        </select>
        <span>跳至</span>
        <input className="h-9 w-14 rounded-md border border-slate-200 text-center outline-none focus:border-blue-300" defaultValue="1" />
        <span>页</span>
      </div>
    </div>
  );
}
