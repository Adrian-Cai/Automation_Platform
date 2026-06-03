import type { ReactNode } from 'react';

import Header from './Header';
import Sidebar from './Sidebar';

export interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <Header />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
