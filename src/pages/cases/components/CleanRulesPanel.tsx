import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CleanRequirementOptions } from "@/pages/cases/requirementInputUtils";

interface CleanRulesPanelProps {
  rules: CleanRequirementOptions;
  onChange: (rules: CleanRequirementOptions) => void;
}

const ruleItems: Array<{ key: keyof CleanRequirementOptions; label: string; description: string }> = [
  { key: "removeEmptyLines", label: "删除空行", description: "移除连续空白行，压缩需求结构。" },
  { key: "trimExtraSpaces", label: "删除多余空格", description: "合并半角、全角空格与 Tab。" },
  { key: "removeInvisibleChars", label: "删除不可见字符", description: "清除零宽字符和 BOM。" },
  { key: "mergeBrokenLines", label: "合并异常换行", description: "修复复制粘贴导致的句内断行。" },
  { key: "preserveMarkdownTables", label: "保留 Markdown 表格", description: "避免清洗过程破坏表格行。" },
];

function CleanRulesPanel({ rules, onChange }: CleanRulesPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">清洗规则</CardTitle>
        <CardDescription>按需开启文本规范化规则，清洗后可在右侧对比预览。</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
        {ruleItems.map((item) => (
          <label key={item.key} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
            <Checkbox
              checked={rules[item.key]}
              className="mt-1"
              onCheckedChange={(checked) => onChange({ ...rules, [item.key]: checked === true })}
            />
            <span>
              <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{item.label}</span>
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
            </span>
          </label>
        ))}
      </CardContent>
    </Card>
  );
}

export default CleanRulesPanel;
