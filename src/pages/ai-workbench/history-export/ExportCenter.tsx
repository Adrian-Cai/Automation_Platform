import { toast } from 'sonner';

import type { ExportOption } from './types';

interface ExportCenterProps {
  options: ExportOption[];
}

export default function ExportCenter({ options }: ExportCenterProps): JSX.Element {
  const handleExport = (format: string) => {
    toast.success(`已开始导出 ${format} 文件`);
  };

  return (
    <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/80">
      <h2 className="text-base font-bold text-slate-950">导出中心</h2>
      <p className="mt-3 text-sm font-medium text-slate-600">导出格式</p>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <article key={option.format} className="rounded-lg border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md hover:shadow-blue-100/70">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${option.iconBgClassName}`}>
                <Icon className={`h-5 w-5 ${option.iconClassName}`} />
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-950">{option.format}</h3>
              <p className="mt-2 min-h-[48px] text-xs leading-5 text-slate-500">{option.description}</p>
              <button
                type="button"
                className="mt-3 h-9 w-full rounded-md border border-blue-200 bg-blue-50/30 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                onClick={() => handleExport(option.format)}
              >
                {option.buttonLabel}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
