import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface RequirementTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export default function RequirementTextEditor({
  value,
  onChange,
  maxLength = 100000,
}: RequirementTextEditorProps): JSX.Element {
  return (
    <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      <CardHeader className="px-5 py-4">
        <CardTitle className="text-base font-bold text-slate-950">
          需求文本
          <span className="ml-2 text-xs font-medium text-slate-400">（支持手动编辑）</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <Textarea
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          placeholder="请输入或粘贴需求内容，例如业务需求、接口说明、产品规则、异常流程等。"
          className="min-h-[260px] resize-none rounded-xl border-slate-200 bg-slate-50/50 font-mono text-sm leading-6 text-slate-800 focus-visible:ring-blue-500"
        />
        <div className="mt-2 text-right text-xs text-slate-400">
          {value.length.toLocaleString('zh-CN')} / {maxLength.toLocaleString('zh-CN')}
        </div>
      </CardContent>
    </Card>
  );
}
