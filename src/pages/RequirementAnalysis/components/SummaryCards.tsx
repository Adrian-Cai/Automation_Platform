import { AlertTriangle, Boxes, ClipboardCheck, HelpCircle } from "lucide-react";

interface SummaryCardsProps {
  seed: number;
  moduleCount: number;
  testPointCount: number;
  questionCount: number;
  riskCount: number;
}

const cardClass = "bg-white rounded-2xl border border-slate-100 shadow-sm p-5";

function SummaryCards({ seed, moduleCount, testPointCount, questionCount, riskCount }: SummaryCardsProps) {
  const summaries = [
    { label: "功能模块数", value: Math.max(7, moduleCount + (seed % 2)), icon: Boxes, color: "text-blue-700", bg: "bg-blue-50" },
    { label: "测试点数", value: Math.max(82, testPointCount + 72 + (seed % 3)), icon: ClipboardCheck, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "需求疑问数", value: Math.max(9, questionCount + (seed % 2)), icon: HelpCircle, color: "text-blue-700", bg: "bg-blue-50" },
    { label: "风险点数", value: Math.max(6, riskCount + (seed % 2)), icon: AlertTriangle, color: "text-teal-600", bg: "bg-teal-50" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaries.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
              </div>
              <div className={`rounded-2xl ${item.bg} p-3 ${item.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SummaryCards;
