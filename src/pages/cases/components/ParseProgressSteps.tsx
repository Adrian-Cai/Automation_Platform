import { CheckCircle2, CircleDot, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ParseProgressStepsProps {
  progress: number;
}

const steps = ["需求接入", "文本清洗", "结构化解析", "测试点生成"];

function ParseProgressSteps({ progress }: ParseProgressStepsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">解析进度</CardTitle>
        <CardDescription>当前为前端交互预览，后续可接入真实异步解析任务。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} />
        <div className="grid gap-3 md:grid-cols-4">
          {steps.map((step, index) => {
            const threshold = (index + 1) * 25;
            const isDone = progress >= threshold;
            const isActive = progress > index * 25 && progress < threshold;
            return (
              <div key={step} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900">
                {isDone ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : isActive ? <CircleDot className="h-4 w-4 text-blue-500" /> : <Clock className="h-4 w-4 text-slate-400" />}
                <span className={isDone || isActive ? "font-medium text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}>{step}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default ParseProgressSteps;
