
'use client';
import type { ReactNode } from 'react';
import { useSidebar } from '@/context/sidebar-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function MainLayout({ children }: { children: ReactNode }) {
  const { sidebarContent } = useSidebar();
  const featuredFirmImage = PlaceHolderImages.find(img => img.id === 'featured-firm-topstep');
  
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
          <Card>
            <CardHeader className="p-0">
              {featuredFirmImage && (
                <div className="relative h-32 w-full">
                  <Image
                    src={featuredFirmImage.imageUrl}
                    alt={featuredFirmImage.description}
                    fill
                    className="object-cover rounded-t-lg"
                    data-ai-hint={featuredFirmImage.imageHint}
                  />
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Featured Firm</h3>
              <p className="text-sm text-muted-foreground mb-4">
                <b>Topstep</b> is a leader in futures trading evaluations. Get funded and trade with their capital.
              </p>
              <Button asChild className="w-full" size="sm">
                <Link href="/firm/topstep">
                  Learn More <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
