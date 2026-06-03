export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, pageSize, total, totalPages, onPageChange }: PaginationProps): JSX.Element {
  const pages = Array.from({ length: Math.min(totalPages, 6) }, (_, index) => `${index + 1}`);
  const displayedPages = totalPages > 6 ? [...pages.slice(0, 5), '...', `${totalPages}`] : pages;

  return (
    <div className="flex items-center justify-between border-t border-[#E5E7EB] px-5 py-4 text-sm text-slate-600">
      <span>共 {total} 条</span>
      <div className="flex items-center gap-2">
        {displayedPages.map((page) => (
          <button
            className={`h-8 min-w-8 rounded-lg border px-2 font-medium ${
              page === `${currentPage}` ? 'border-[#2563EB] bg-[#2563EB] text-white' : 'border-[#E5E7EB] bg-white text-slate-600 hover:border-blue-200 hover:text-[#2563EB]'
            }`}
            key={page}
            type="button"
            disabled={page === '...'}
            onClick={() => {
              if (page !== '...') {
                onPageChange(Number(page));
              }
            }}
          >
            {page}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span>{pageSize} 条 / 页</span>
        <label className="flex items-center gap-2">
          跳转
          <input
            className="h-8 w-14 rounded-lg border border-[#E5E7EB] px-2 text-center outline-none focus:border-[#2563EB]"
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(event) => {
              const nextPage = Number(event.target.value);
              if (Number.isInteger(nextPage) && nextPage >= 1 && nextPage <= totalPages) {
                onPageChange(nextPage);
              }
            }}
          />
          页
        </label>
      </div>
    </div>
  );
}
