import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RequirementTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function RequirementTextEditor({ value, onChange }: RequirementTextEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">原始需求文本</CardTitle>
        <CardDescription>粘贴 PRD、用户故事、接口说明或测试验收标准，后续将基于清洗结果生成结构化内容。</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          className="min-h-[260px] resize-y font-mono text-sm leading-6"
          placeholder="示例：\n作为运营人员，我希望可以批量导入优惠券规则...\n| 字段 | 说明 |\n| --- | --- |"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </CardContent>
    </Card>
  );
}

export default RequirementTextEditor;
