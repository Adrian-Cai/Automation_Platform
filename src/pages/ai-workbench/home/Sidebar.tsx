import { useState } from 'react';
import { BookOpen, FileInput, FileText, Home, PanelLeftClose, Settings, ShieldCheck, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MenuItem {
  label: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  { label: '工作台总览', icon: Home },
  { label: '需求输入与解析', icon: FileInput },
  { label: '需求分析与测试点', icon: Target },
  { label: '用例生成与编辑', icon: FileText },
  { label: '质量检查与覆盖率', icon: ShieldCheck },
  { label: '历史记录与导出', icon: BookOpen },
  { label: '设置', icon: Settings },
];

export default function Sidebar(): JSX.Element {
  const [activeLabel, setActiveLabel] = useState('工作台总览');

  return (
    <aside className="flex h-[calc(100vh-64px)] w-[220px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white">
      <nav className="flex-1 space-y-2 px-3 py-5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeLabel === item.label;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveLabel(item.label)}
              className={`relative flex h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-medium transition ${
                isActive ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#374151] hover:bg-slate-50 hover:text-[#2563EB]'
              }`}
            >
              {isActive ? <span className="absolute left-0 top-3 h-6 w-1 rounded-r-full bg-[#2563EB]" /> : null}
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="border-t border-[#E5E7EB] px-4 py-4">
        <button type="button" className="flex h-10 w-full items-center gap-3 rounded-xl px-2 text-sm text-[#6B7280] transition hover:bg-slate-50 hover:text-[#2563EB]">
          <PanelLeftClose className="h-5 w-5" />
          收起菜单
        </button>
      </div>
    </aside>
  );
}
