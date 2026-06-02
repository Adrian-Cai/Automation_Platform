import ComingSoon from '@/pages/ComingSoon';
import { BrainCircuit } from 'lucide-react';

export default function AiWorkbenchOverview(): JSX.Element {
  return (
    <ComingSoon
      title="AI 工作台总览"
      description="AI 工作台总览功能正在开发中"
      icon={<BrainCircuit className="h-10 w-10 text-blue-500" />}
    />
  );
}
