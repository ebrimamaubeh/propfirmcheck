'use client';
import type { ReactNode } from 'react';
import { useSidebar } from '@/context/sidebar-context';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


interface BlogLayoutProps {
  children: ReactNode;
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string) => void;
}

export function BlogLayout({ children, categories, activeCategory, onCategoryChange }: BlogLayoutProps) {
    const { setSidebarContent } = useSidebar();

    useEffect(() => {
        const sidebar = (
             <Card>
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-2">
                        {categories.map(category => (
                            <Button
                                key={category}
                                variant={activeCategory === category ? 'default' : 'ghost'}
                                onClick={() => onCategoryChange(category)}
                                className="justify-start"
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );

        setSidebarContent(sidebar);

        // Clear sidebar when component unmounts
        return () => {
            setSidebarContent(null);
        };
    }, [categories, activeCategory, onCategoryChange, setSidebarContent]);
    
  return (
    <main>
        {children}
    </main>
  );
}
