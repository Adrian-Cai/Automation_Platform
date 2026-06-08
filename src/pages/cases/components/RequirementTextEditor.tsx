import { Textarea } from "@/components/ui/textarea";

interface RequirementTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function RequirementTextEditor({ value, onChange }: RequirementTextEditorProps) {
  const lineCount = value ? value.split("\n").length : 0;

  return (
    <div className="w-full rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/60 dark:bg-[#131729]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
            原始需求文本
          </h3>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            粘贴 PRD、用户故事或验收标准
          </p>
        </div>
        {lineCount > 0 && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {lineCount} 行
          </span>
        )}
      </div>
      <Textarea
        className="w-full min-h-[280px] resize-y rounded-xl border-slate-200 bg-slate-50/30 font-mono text-sm leading-6 transition-colors focus:bg-white dark:border-slate-700 dark:bg-slate-900/30 dark:focus:bg-slate-900/60"
        placeholder={`示例：\n作为运营人员，我希望可以批量导入优惠券规则...\n\n| 字段 | 说明 |\n| --- | --- |\n| 优惠类型 | 满减/折扣/免运费 |`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default RequirementTextEditor;
