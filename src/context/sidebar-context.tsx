
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface SidebarContextType {
  sidebarContent: ReactNode | null;
  setSidebarContent: (content: ReactNode | null) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarContent, setSidebarContent] = useState<ReactNode | null>(null);

  return (
    <SidebarContext.Provider value={{ sidebarContent, setSidebarContent }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextType {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
