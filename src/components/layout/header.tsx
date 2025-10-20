
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';
import { useLoading } from '@/context/loading-context';

export function Header() {
  const { setIsLoading } = useLoading();

  const handleLinkClick = () => {
    setIsLoading(true);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2" onClick={handleLinkClick}>
            <Building className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">Prop Firm Check</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center space-x-2 sm:space-x-4 justify-end">
          <Button variant="ghost" asChild size="sm">
            <Link href="/" onClick={handleLinkClick}>Home</Link>
          </Button>
          <Button variant="ghost" asChild size="sm">
            <Link href="/about" onClick={handleLinkClick}>About</Link>
          </Button>
          <Button variant="ghost" asChild size="sm">
            <Link href="/contact" onClick={handleLinkClick}>Contact</Link>
          </Button>
          <Button variant="ghost" asChild size="sm">
            <Link href="/blog" onClick={handleLinkClick}>Blog</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
