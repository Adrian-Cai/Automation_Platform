import type { ProjectStatus } from '@/pages/ai-workbench/home/types';

interface StatusBadgeProps {
  status: ProjectStatus;
}

const statusClassNames: Record<ProjectStatus, string> = {
  已完成: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  解析完成: 'bg-teal-50 text-teal-600 border-teal-100',
  用例生成中: 'bg-blue-50 text-blue-600 border-blue-100',
  测试点生成中: 'bg-orange-50 text-orange-600 border-orange-100',
};

export default function StatusBadge({ status }: StatusBadgeProps): JSX.Element {
  return (
    <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${statusClassNames[status]}`}>
      {status}
    </span>
  );
}
