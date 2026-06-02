export default function Pagination(): JSX.Element {
  const pages = ['1', '2', '3', '4', '5', '...', '25'];
  return (
    <div className="flex items-center justify-between border-t border-[#E5E7EB] px-5 py-4 text-sm text-slate-600">
      <span>共 248 条</span>
      <div className="flex items-center gap-2">
        {pages.map((page) => (
          <button
            className={`h-8 min-w-8 rounded-lg border px-2 font-medium ${
              page === '1' ? 'border-[#2563EB] bg-[#2563EB] text-white' : 'border-[#E5E7EB] bg-white text-slate-600 hover:border-blue-200 hover:text-[#2563EB]'
            }`}
            key={page}
            type="button"
          >
            {page}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span>10 条 / 页</span>
        <label className="flex items-center gap-2">
          跳转
          <input className="h-8 w-14 rounded-lg border border-[#E5E7EB] px-2 text-center outline-none focus:border-[#2563EB]" type="text" />
          页
        </label>
      </div>
    </div>
  );
}
