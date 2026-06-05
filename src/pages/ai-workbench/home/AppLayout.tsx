import type { ReactNode } from 'react';

import Header from '@/pages/ai-workbench/home/Header';
import Sidebar from '@/pages/ai-workbench/home/Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      <Header />
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
}
