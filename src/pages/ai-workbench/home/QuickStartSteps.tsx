import { ChevronRight } from 'lucide-react';

import type { QuickStartStep } from '@/pages/ai-workbench/home/types';

interface QuickStartStepsProps {
  steps: QuickStartStep[];
}

export default function QuickStartSteps({ steps }: QuickStartStepsProps): JSX.Element {
  const handleStepClick = (stepName: string): void => {
    console.log(`快速开始步骤：${stepName}`);
  };

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <div className="mb-4">
        <h2 className="text-base font-bold text-[#111827]">快速开始</h2>
        <p className="mt-1 text-sm text-[#6B7280]">按流程完成一次需求到用例的闭环</p>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="relative">
              <button
                type="button"
                onClick={() => handleStepClick(step.title)}
                className="flex min-h-[132px] w-full flex-col items-center rounded-xl border border-[#E5E7EB] bg-white px-3 py-4 text-center transition hover:border-blue-200 hover:shadow-md"
              >
                <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <Icon className="mt-4 h-8 w-8 text-[#2563EB]" />
                <h3 className="mt-3 text-sm font-bold text-[#111827]">{step.title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#6B7280]">{step.description}</p>
              </button>
              {index < steps.length - 1 ? (
                <ChevronRight className="absolute -right-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 rounded-full bg-[#F8FAFC] text-[#6B7280]" />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
