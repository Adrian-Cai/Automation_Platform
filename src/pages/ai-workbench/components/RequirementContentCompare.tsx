import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RequirementContentCompareProps {
  rawContent: string;
  cleanedContent: string;
}

function PreviewPanel({ content, emptyText }: { content: string; emptyText: string }): JSX.Element {
  if (!content) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center text-sm text-slate-400">
        {emptyText}
      </div>
    );
  }

  return (
    <pre className="h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50/80 p-4 font-mono text-sm leading-6 text-slate-800">
      {content}
    </pre>
  );
}

export default function RequirementContentCompare({ rawContent, cleanedContent }: RequirementContentCompareProps): JSX.Element {
  return (
    <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto_1fr]">
        <div>
          <CardHeader className="px-0 pb-3 pt-0">
            <CardTitle className="text-base font-bold text-slate-950">原始内容</CardTitle>
          </CardHeader>
          <PreviewPanel content={rawContent} emptyText="暂无原始内容，请上传文档或粘贴需求文本。" />
        </div>
        <div className="hidden items-center justify-center px-1 text-slate-300 lg:flex">
          <ArrowRight className="h-5 w-5" />
        </div>
        <div>
          <CardHeader className="flex-row items-center justify-between px-0 pb-3 pt-0">
            <CardTitle className="text-base font-bold text-slate-950">清洗后内容</CardTitle>
            {cleanedContent && (
              <Badge variant="success" className="gap-1 border-0">
                <CheckCircle2 className="h-3.5 w-3.5" />
                清洗完成
              </Badge>
            )}
          </CardHeader>
          <PreviewPanel content={cleanedContent} emptyText="暂无清洗结果，请点击开始解析。" />
        </div>
      </CardContent>
    </Card>
  );
}
