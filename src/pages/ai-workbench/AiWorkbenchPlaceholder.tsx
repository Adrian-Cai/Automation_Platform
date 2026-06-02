import ComingSoon from '@/pages/ComingSoon';
import { BarChart3, ClipboardList, Settings, Target } from 'lucide-react';

interface AiWorkbenchPlaceholderProps {
  title: string;
  description: string;
  icon: 'clipboard' | 'target' | 'chart' | 'settings';
}

const icons = {
  clipboard: <ClipboardList className="h-10 w-10 text-blue-500" />,
  target: <Target className="h-10 w-10 text-blue-500" />,
  chart: <BarChart3 className="h-10 w-10 text-blue-500" />,
  settings: <Settings className="h-10 w-10 text-blue-500" />,
} satisfies Record<AiWorkbenchPlaceholderProps['icon'], JSX.Element>;

export default function AiWorkbenchPlaceholder({
  title,
  description,
  icon,
}: AiWorkbenchPlaceholderProps): JSX.Element {
  return <ComingSoon title={title} description={description} icon={icons[icon]} />;
}
