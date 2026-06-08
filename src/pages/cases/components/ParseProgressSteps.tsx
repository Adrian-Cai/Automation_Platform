import { CheckCircle2, CircleDot, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ParseProgressStepsProps {
  progress: number;
}

const steps = [
  { label: "需求接入", description: "文件与文本导入" },
  { label: "文本清洗", description: "规则化预处理" },
  { label: "结构化解析", description: "AI 语义理解" },
  { label: "测试点生成", description: "输出用例建议" },
];

function ParseProgressSteps({ progress }: ParseProgressStepsProps) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/60 dark:bg-[#131729]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
          解析进度
        </h3>
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
          {progress}%
        </span>
      </div>

      <Progress
        className="mb-5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800"
        value={progress}
      />

      <div className="flex items-start gap-0">
        {steps.map((step, index) => {
          const threshold = (index + 1) * 25;
          const isDone = progress >= threshold;
          const isActive = progress > index * 25 && progress < threshold;

          return (
            <div key={step.label} className="flex flex-1 items-start">
              {/* Step node */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isDone
                      ? "border-[#39E079] bg-[#39E079]/10"
                      : isActive
                        ? "border-blue-500 bg-blue-500/10 shadow-md shadow-blue-500/20"
                        : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-[#2ba85a] dark:text-[#39E079]" />
                  ) : isActive ? (
                    <CircleDot className="h-4 w-4 text-blue-500 animate-pulse" />
                  ) : (
                    <Clock className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-medium ${
                      isDone || isActive ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="mx-2 mt-3.5 flex-1">
                  <div
                    className={`h-0.5 rounded-full transition-all duration-500 ${
                      isDone ? "bg-[#39E079]" : "bg-slate-150 dark:bg-slate-800"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ParseProgressSteps;
