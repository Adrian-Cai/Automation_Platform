import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RiskLevel, RiskPoint } from "../types";

interface RiskCardsProps {
  risks: RiskPoint[];
}

const levelClass: Record<RiskLevel, string> = {
  P0: "bg-red-50 text-red-700 border-red-100",
  P1: "bg-orange-50 text-orange-700 border-orange-100",
  P2: "bg-blue-50 text-blue-700 border-blue-100",
};

function RiskCards({ risks }: RiskCardsProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">风险点识别</h2>
        <p className="text-sm text-slate-500">按优先级聚焦高风险业务规则和测试建议。</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {risks.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-slate-50 p-2 text-blue-700"><AlertTriangle className="h-5 w-5" /></span>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
              </div>
              <Badge variant="outline" className={levelClass[item.level]}>{item.level}</Badge>
            </div>
            <p className="text-sm leading-6 text-slate-600">{item.description}</p>
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
              <p><span className="font-medium text-slate-700">影响模块：</span><span className="text-slate-600">{item.module}</span></p>
              <p className="mt-2"><span className="font-medium text-slate-700">建议测试方法：</span><span className="text-slate-600">{item.suggestion}</span></p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default RiskCards;
