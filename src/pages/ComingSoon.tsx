import { Construction, Wrench, Clock, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function ComingSoon({ title, description, icon }: ComingSoonProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10 border border-blue-200/50 dark:border-blue-500/20">
          {icon || <Construction className="h-10 w-10 text-blue-500" />}
        </div>

        {/* Title */}
        <h1 className="text-display-md text-slate-900 dark:text-white mb-3">
          {title}
        </h1>

        {/* Description */}
        <p className="text-body-md text-slate-500 dark:text-slate-400 mb-8">
          {description || '该功能正在开发中，敬请期待...'}
        </p>

        {/* Status Card */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 p-6 mb-8">
          <div className="flex items-center justify-center gap-6 text-body-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Wrench className="h-4 w-4 text-orange-500" />
              <span>开发中</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>即将上线</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => setLocation('/dashboard')}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-body-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          返回仪表盘
        </button>
      </div>
    </div>
  );
}
