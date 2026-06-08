import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="relative mb-8">
          <h1 className="text-display-xl text-slate-200 dark:text-slate-700">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-display-lg text-slate-900 dark:text-white">404</span>
          </div>
        </div>
        
        <h2 className="text-display-sm text-slate-900 dark:text-white mb-3">
          页面未找到
        </h2>
        <p className="text-body-md text-slate-500 dark:text-slate-400 mb-8">
          您访问的页面不存在或已被移动。请检查 URL 是否正确，或返回首页继续操作。
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回上页
          </Button>
          <Button 
            onClick={() => setLocation('/')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}
