import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { QuestionStatus, RequirementQuestion, RiskLevel } from "../types";

interface QuestionTableProps {
  questions: RequirementQuestion[];
  onUpdateStatus: (id: string, status: QuestionStatus) => void;
}

const statusClass: Record<QuestionStatus, string> = {
  待确认: "bg-blue-50 text-blue-700 border-blue-100",
  已确认: "bg-green-50 text-green-700 border-green-100",
  已忽略: "bg-slate-100 text-slate-500 border-slate-200",
};

const riskClass: Record<RiskLevel, string> = {
  P0: "bg-red-50 text-red-700 border-red-100",
  P1: "bg-orange-50 text-orange-700 border-orange-100",
  P2: "bg-blue-50 text-blue-700 border-blue-100",
};

function QuestionTable({ questions, onUpdateStatus }: QuestionTableProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">需求疑问识别</h2>
        <p className="text-sm text-slate-500">沉淀影响测试范围和验收标准的待确认问题。</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">疑问描述</th>
              <th className="px-4 py-3 font-medium">影响模块</th>
              <th className="px-4 py-3 font-medium">风险等级</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {questions.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="max-w-xl px-4 py-3 text-slate-700">{item.description}</td>
                <td className="px-4 py-3 text-slate-600">{item.module}</td>
                <td className="px-4 py-3"><Badge variant="outline" className={riskClass[item.riskLevel]}>{item.riskLevel}</Badge></td>
                <td className="px-4 py-3"><Badge variant="outline" className={statusClass[item.status]}>{item.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={item.status === "已确认"} onClick={() => onUpdateStatus(item.id, "已确认")}>标记已确认</Button>
                    <Button variant="ghost" size="sm" disabled={item.status === "已忽略"} onClick={() => onUpdateStatus(item.id, "已忽略")}>忽略</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default QuestionTable;
