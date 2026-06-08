import { Checkbox } from "@/components/ui/checkbox";
import { CleanRequirementOptions } from "@/pages/cases/requirementInputUtils";

interface CleanRulesPanelProps {
  rules: CleanRequirementOptions;
  onChange: (rules: CleanRequirementOptions) => void;
}

const ruleItems: Array<{ key: keyof CleanRequirementOptions; label: string; description: string }> = [
  { key: "removeEmptyLines", label: "删除空行", description: "移除连续空白行" },
  { key: "trimExtraSpaces", label: "删除多余空格", description: "合并半角、全角空格" },
  { key: "removeInvisibleChars", label: "删除不可见字符", description: "清除零宽字符和 BOM" },
  { key: "mergeBrokenLines", label: "合并异常换行", description: "修复句内断行" },
  { key: "preserveMarkdownTables", label: "保留 Markdown 表格", description: "避免清洗破坏表格" },
];

function CleanRulesPanel({ rules, onChange }: CleanRulesPanelProps) {
  const activeCount = ruleItems.filter((item) => rules[item.key]).length;

  return (
    <div className="w-full rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/60 dark:bg-[#131729]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
          清洗规则
        </h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {activeCount}/{ruleItems.length} 已启用
        </span>
      </div>
      <div className="space-y-2">
        {ruleItems.map((item) => (
          <label
            key={item.key}
            className="group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/30 px-3 py-2.5 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-sm dark:border-slate-800/60 dark:bg-slate-900/20 dark:hover:border-slate-700 dark:hover:bg-slate-900/40"
          >
            <Checkbox
              checked={rules[item.key]}
              className="transition-transform duration-150 group-hover:scale-110"
              onCheckedChange={(checked) => onChange({ ...rules, [item.key]: checked === true })}
            />
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                {item.label}
              </span>
              <span className="mt-0.5 block text-xs text-slate-400 dark:text-slate-500">
                {item.description}
              </span>
            </div>
            {rules[item.key] && (
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#39E079] shadow-sm shadow-[#39E079]/50" />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

export default CleanRulesPanel;
