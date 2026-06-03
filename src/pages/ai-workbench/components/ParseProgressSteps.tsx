import { CheckCircle2, Circle, UploadCloud, FileSearch, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ParseStatus } from '@/lib/requirementInput';

interface ParseProgressStepsProps {
  parseStep: number;
  parseStatus: ParseStatus;
}

const steps = [
  { label: '上传完成', icon: UploadCloud },
  { label: '文档解析', icon: FileSearch },
  { label: '内容清洗', icon: Sparkles },
  { label: '结构化完成', icon: CheckCircle2 },
] as const;

export default function ParseProgressSteps({ parseStep, parseStatus }: ParseProgressStepsProps): JSX.Element {
  const progressValue = parseStatus === 'idle' ? 0 : Math.min(((parseStep + 1) / steps.length) * 100, 100);

  return (
    <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      <CardHeader className="px-5 py-4">
        <CardTitle className="text-base font-bold text-slate-950">解析进度</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <Progress value={progressValue} className="mb-5 h-2 bg-slate-100" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isFinished = parseStatus === 'success' ? index <= parseStep : index < parseStep;
            const isLoading = parseStatus === 'parsing' && index === parseStep;
            const isWaiting = !isFinished && !isLoading;

            return (
              <div key={step.label} className="relative flex items-center gap-3 sm:flex-col sm:items-start">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  isFinished
                    ? 'bg-emerald-100 text-emerald-700'
                    : isLoading
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-slate-100 text-slate-400'
                }`}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isWaiting ? <Circle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${isWaiting ? 'text-slate-400' : 'text-slate-800'}`}>{step.label}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {isFinished ? '已完成' : isLoading ? '处理中' : '等待中'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
