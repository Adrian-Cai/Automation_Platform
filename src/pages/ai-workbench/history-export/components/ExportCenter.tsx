import type { ExportFormatOption } from '../types';

export interface ExportCenterProps {
  formats: ExportFormatOption[];
  onExport: (format: ExportFormatOption) => void;
}

export default function ExportCenter({ formats, onExport }: ExportCenterProps): JSX.Element {
  return (
    <section className="w-full rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-950">导出中心</h2>
        <p className="mt-1 text-sm text-slate-500">选择 Excel、Markdown、JSON 或测试平台同步生成导出任务。</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {formats.map((format) => {
          const Icon = format.icon;
          return (
            <button className="w-full rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md" key={format.format} type="button" onClick={() => onExport(format)}>
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="block text-base font-bold text-slate-950">{format.title}</span>
              <span className="mt-2 block text-sm leading-6 text-slate-500">{format.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
