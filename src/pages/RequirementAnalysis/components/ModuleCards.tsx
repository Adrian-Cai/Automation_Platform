import { BrainCircuit, Database, GitBranch, ShieldCheck } from "lucide-react";
import type { RequirementModule, ModuleType } from "../types";

interface ModuleCardsProps {
  modules: RequirementModule[];
  selectedModule: string;
  onSelectModule: (moduleName: string) => void;
}

const iconMap: Record<ModuleType, React.ComponentType<{ className?: string }>> = {
  核心流程: GitBranch,
  业务支撑: ShieldCheck,
  数据服务: Database,
  系统集成: BrainCircuit,
};

function ModuleCards({ modules, selectedModule, onSelectModule }: ModuleCardsProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">功能模块识别</h2>
          <p className="text-sm text-slate-500">点击模块可联动筛选核心测试点列表。</p>
        </div>
        {selectedModule && (
          <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => onSelectModule("")}>清除筛选</button>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {modules.map((item) => {
          const Icon = iconMap[item.type];
          const active = selectedModule === item.name;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectModule(item.name)}
              className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${active ? "border-blue-300 bg-blue-50 shadow-sm" : "border-slate-100 bg-white"}`}
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-xl bg-teal-50 p-2 text-teal-600"><Icon className="h-5 w-5" /></span>
                <span className="text-xs font-medium text-blue-700">{item.type}</span>
              </div>
              <h3 className="font-semibold text-slate-900">{item.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default ModuleCards;
