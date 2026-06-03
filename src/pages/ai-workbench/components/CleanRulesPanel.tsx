import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { CleanRules } from '@/lib/requirementInput';

interface CleanRulesPanelProps {
  rules: CleanRules;
  onChange: (rules: CleanRules) => void;
  onReset: () => void;
}

const ruleOptions: Array<{ key: keyof CleanRules; label: string }> = [
  { key: 'removeEmptyLines', label: '删除空行' },
  { key: 'removeExtraSpaces', label: '删除多余空格' },
  { key: 'removeGarbledChars', label: '删除乱码字符' },
  { key: 'keepHeadingLevel', label: '保留标题层级' },
  { key: 'keepTableContent', label: '保留表格内容' },
  { key: 'mergeAbnormalLineBreaks', label: '合并异常换行' },
];

export default function CleanRulesPanel({ rules, onChange, onReset }: CleanRulesPanelProps): JSX.Element {
  return (
    <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      <CardHeader className="flex-row items-center justify-between px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-950">
          清洗规则
          <Info className="h-4 w-4 text-slate-400" />
        </CardTitle>
        <Button type="button" variant="link" className="h-auto px-0 py-0 text-blue-600" onClick={onReset}>
          重置为默认
        </Button>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ruleOptions.map((option) => (
            <label key={option.key} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
              <Checkbox
                checked={rules[option.key]}
                onCheckedChange={(checked) => onChange({ ...rules, [option.key]: checked === true })}
                className="rounded border-blue-500 data-[state=checked]:bg-blue-600"
              />
              {option.label}
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
