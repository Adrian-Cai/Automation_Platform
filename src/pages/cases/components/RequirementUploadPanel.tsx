import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequirementUploadPanelProps {
  onFilesSelected: (files: File[]) => void;
}

function RequirementUploadPanel({ onFilesSelected }: RequirementUploadPanelProps) {
  return (
    <div className="w-full rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/60 dark:bg-[#131729]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
          <UploadCloud className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
            上传需求附件
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            支持 TXT、Markdown、PDF、Word、Excel
          </p>
        </div>
      </div>
      <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-8 text-center transition-all duration-200 hover:border-[#39E079]/50 hover:bg-[#39E079]/5 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-[#39E079]/30 dark:hover:bg-[#39E079]/5">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 transition-colors duration-200 group-hover:bg-[#39E079]/15 dark:bg-slate-800 dark:group-hover:bg-[#39E079]/10">
          <UploadCloud className="h-5 w-5 text-slate-400 transition-colors duration-200 group-hover:text-[#2ba85a] dark:text-slate-500 dark:group-hover:text-[#39E079]" />
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          点击选择或拖拽文件到此处
        </span>
        <span className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          文本类文件会自动读取内容，可与文本输入合并
        </span>
        <input
          className="sr-only"
          multiple
          type="file"
          accept=".txt,.md,.markdown,.pdf,.doc,.docx,.xls,.xlsx,.csv"
          onChange={(event) => {
            onFilesSelected(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
        <Button
          className="mt-4 h-8 rounded-lg border border-slate-200 bg-white px-4 text-xs font-medium shadow-none transition-all hover:bg-slate-50 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750"
          type="button"
          variant="outline"
        >
          选择文件
        </Button>
      </label>
    </div>
  );
}

export default RequirementUploadPanel;
