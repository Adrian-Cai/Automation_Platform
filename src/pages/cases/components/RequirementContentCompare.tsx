import { Badge } from "@/components/ui/badge";

interface RequirementContentCompareProps {
  rawText: string;
  cleanedText: string;
  wordCount: number;
}

function RequirementContentCompare({ rawText, cleanedText, wordCount }: RequirementContentCompareProps) {
  const rawLineCount = rawText ? rawText.split("\n").length : 0;
  const cleanLineCount = cleanedText ? cleanedText.split("\n").length : 0;

  return (
    <div className="w-full rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/60 dark:bg-[#131729]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
            内容清洗对比
          </h3>
          <div className="flex items-center gap-2">
            <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              原始 {rawLineCount} 行
            </Badge>
            <Badge className="bg-[#39E079]/10 text-[#2ba85a] dark:bg-[#39E079]/15 dark:text-[#39E079]">
              清洗后 {cleanLineCount} 行
            </Badge>
          </div>
        </div>
        {wordCount > 0 && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            共 {wordCount} 字符
          </span>
        )}
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="relative min-w-0">
          <div className="absolute left-3 top-3 text-[10px] font-medium uppercase tracking-wider text-slate-400/60 dark:text-slate-500/60">
            原始
          </div>
          <pre className="min-h-[280px] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50/50 p-4 pt-7 font-mono text-xs leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
            {rawText || (
              <span className="text-slate-300 dark:text-slate-600">
                暂无原始需求内容
              </span>
            )}
          </pre>
        </div>
        <div className="relative min-w-0">
          <div className="absolute left-3 top-3 text-[10px] font-medium uppercase tracking-wider text-[#2ba85a]/60 dark:text-[#39E079]/60">
            清洗后
          </div>
          <pre className="min-h-[280px] overflow-auto whitespace-pre-wrap rounded-xl border border-[#39E079]/10 bg-[#39E079]/5 p-4 pt-7 font-mono text-xs leading-6 text-slate-700 dark:border-[#39E079]/10 dark:bg-[#39E079]/5 dark:text-slate-200">
            {cleanedText || (
              <span className="text-slate-300 dark:text-slate-600">
                清洗后内容将在这里展示
              </span>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default RequirementContentCompare;
