import { type ReactNode } from 'react';
import { BrainCircuit, FileText, History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkbenchHeaderProps {
  title: string;
  saveStateText: string;
  remoteStatusText: string;
  onOpenRequirement: () => void;
  onOpenHistory: () => void;
  onNewWorkspace?: () => void;
  titleIcon?: ReactNode;
}

export function WorkbenchHeader({
  title,
  saveStateText,
  remoteStatusText,
  onOpenRequirement,
  onOpenHistory,
  onNewWorkspace,
  titleIcon,
}: WorkbenchHeaderProps) {
  return (
    <header className="shrink-0 h-12 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
          {titleIcon ?? <BrainCircuit className="h-4 w-4" />}
        </div>
        <h1 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        {onNewWorkspace && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-950/30"
            onClick={onNewWorkspace}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>新建工作台</span>
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          onClick={onOpenHistory}
        >
          <History className="h-3.5 w-3.5" />
          <span>历史记录</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          onClick={onOpenRequirement}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>需求信息</span>
        </Button>
        <span>{saveStateText}</span>
        <span>{remoteStatusText}</span>
      </div>
    </header>
  );
}
