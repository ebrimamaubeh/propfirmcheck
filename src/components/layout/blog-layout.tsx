
'use client';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BlogLayoutProps {
  children: ReactNode;
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function BlogLayout({ children, categories, activeCategory, onCategoryChange }: BlogLayoutProps) {
  return (
    <div className="container flex-1">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="hidden md:block md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-2">
                        {categories.map(category => (
                            <Button
                                key={category}
                                variant={activeCategory === category || (activeCategory === null && category === 'All') ? 'default' : 'ghost'}
                                onClick={() => onCategoryChange(category === 'All' ? null : category)}
                                className="justify-start"
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </aside>
        <main className="md:col-span-3">
          {children}
        </main>
      </div>
    </div>
  );
}
