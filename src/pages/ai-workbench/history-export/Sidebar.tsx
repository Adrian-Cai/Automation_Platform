import { BarChart3, ChevronLeft, ClipboardPenLine, FileInput, History, LayoutDashboard, Settings, ShieldCheck } from 'lucide-react';

const menuItems = [
  { label: '工作台总览', icon: LayoutDashboard },
  { label: '需求输入与解析', icon: FileInput },
  { label: '需求分析与测试点', icon: BarChart3 },
  { label: '用例生成与编辑', icon: ClipboardPenLine },
  { label: '质量检查与覆盖率', icon: ShieldCheck },
  { label: '历史记录与导出', icon: History, active: true },
  { label: '设置', icon: Settings },
];

export default function Sidebar(): JSX.Element {
  return (
    <aside className="flex w-[250px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <nav className="flex-1 space-y-2 px-3 py-7">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              className={`flex h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-[15px] font-semibold transition ${item.active ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700'}`}
            >
              <Icon className={`h-5 w-5 ${item.active ? 'text-blue-600' : 'text-slate-500'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <button type="button" className="flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <ChevronLeft className="h-4 w-4" />
          收起菜单
        </button>
      </div>
    </aside>
  );
}
