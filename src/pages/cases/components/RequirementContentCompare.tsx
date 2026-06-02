import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RequirementContentCompareProps {
  rawText: string;
  cleanedText: string;
}

function RequirementContentCompare({ rawText, cleanedText }: RequirementContentCompareProps) {
  const rawLineCount = rawText ? rawText.split("\n").length : 0;
  const cleanLineCount = cleanedText ? cleanedText.split("\n").length : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">内容清洗对比</CardTitle>
            <CardDescription>左侧为原始输入，右侧为清洗后的解析候选内容。</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">原始 {rawLineCount} 行</Badge>
            <Badge variant="success">清洗 {cleanLineCount} 行</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <pre className="min-h-[260px] overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
          {rawText || "暂无原始需求内容"}
        </pre>
        <pre className="min-h-[260px] overflow-auto rounded-xl bg-blue-950 p-4 text-xs leading-6 text-blue-50">
          {cleanedText || "清洗后内容将在这里展示"}
        </pre>
      </CardContent>
    </Card>
  );
}

export default RequirementContentCompare;
