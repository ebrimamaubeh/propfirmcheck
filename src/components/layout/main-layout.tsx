import type { ReactNode } from 'react';

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container flex-1">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <aside className="hidden md:block md:col-span-1">
          {/* Left sidebar content goes here */}
        </aside>
        <main className="md:col-span-3">
          {children}
        </main>
        <aside className="hidden md:block md:col-span-1">
          {/* Right sidebar content goes here */}
        </aside>
      </div>
    </div>
  );
}
