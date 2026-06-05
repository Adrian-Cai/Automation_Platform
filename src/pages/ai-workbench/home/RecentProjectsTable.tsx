import { ChevronRight, Eye, MoreVertical } from 'lucide-react';

import StatusBadge from '@/pages/ai-workbench/home/StatusBadge';
import type { RecentProject } from '@/pages/ai-workbench/home/types';

interface RecentProjectsTableProps {
  projects: RecentProject[];
}

export default function RecentProjectsTable({ projects }: RecentProjectsTableProps): JSX.Element {
  const handleViewAll = (): void => {
    console.log('查看全部最近项目');
  };

  const handleViewProject = (): void => {
    alert('查看项目详情');
  };

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#111827]">最近项目</h2>
        <button type="button" onClick={handleViewAll} className="flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:underline">
          查看全部 <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="bg-[#F8FAFC] text-left text-xs font-semibold text-[#6B7280]">
            <tr>
              <th className="w-[23%] px-4 py-3">项目名称</th>
              <th className="w-[31%] px-4 py-3">需求名称</th>
              <th className="w-[16%] px-4 py-3">状态</th>
              <th className="w-[20%] px-4 py-3">更新时间</th>
              <th className="w-[10%] px-4 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] text-[#111827]">
            {projects.map((project) => (
              <tr key={`${project.projectName}-${project.updatedAt}`} className="bg-white transition hover:bg-[#F8FAFC]">
                <td className="truncate px-4 py-3 font-medium">{project.projectName}</td>
                <td className="truncate px-4 py-3 text-[#374151]">{project.requirementName}</td>
                <td className="px-4 py-3"><StatusBadge status={project.status} /></td>
                <td className="px-4 py-3 text-[#374151]">{project.updatedAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-3">
                    <button type="button" onClick={handleViewProject} className="text-[#2563EB] transition hover:text-blue-700" aria-label="查看项目详情">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button type="button" className="text-[#111827] transition hover:text-[#2563EB]" aria-label="更多操作">
                      <MoreVertical className="h-4 w-4" />
                    </button>
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
