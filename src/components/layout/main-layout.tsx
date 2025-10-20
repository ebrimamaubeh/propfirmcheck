
'use client';
import type { ReactNode } from 'react';
import { useSidebar } from '@/context/sidebar-context';

export function MainLayout({ children }: { children: ReactNode }) {
  const { sidebarContent } = useSidebar();
  
  return (
    <div className="container flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        <aside className="hidden lg:block lg:col-span-2">
          {sidebarContent}
        </aside>
        <main className="lg:col-span-6">
          {children}
        </main>
        <aside className="hidden lg:block lg:col-span-2">
          {/* Right sidebar content goes here */}
        </aside>
      </div>
    </div>
  );
}
