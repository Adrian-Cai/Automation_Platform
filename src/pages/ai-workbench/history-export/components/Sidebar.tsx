import { BarChart3, ClipboardList, FileInput, History, LayoutDashboard, Settings, ShieldCheck } from 'lucide-react';

const menuItems = [
  { label: '工作台总览', icon: LayoutDashboard },
  { label: '需求输入与解析', icon: FileInput },
  { label: '需求分析与测试点', icon: ClipboardList },
  { label: '用例生成与编辑', icon: BarChart3 },
  { label: '质量检查与覆盖率', icon: ShieldCheck },
  { label: '历史记录与导出', icon: History },
  { label: '设置', icon: Settings },
];

export default function Sidebar(): JSX.Element {
  return (
    <aside className="w-64 shrink-0 border-r border-[#E5E7EB] bg-white px-4 py-5">
      <div className="mb-5 px-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Workspace</div>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = item.label === '历史记录与导出';
          return (
            <button
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                active ? 'bg-blue-50 text-[#2563EB] shadow-sm ring-1 ring-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              key={item.label}
              type="button"
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
