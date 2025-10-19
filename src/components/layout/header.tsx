import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Building className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">Prop Firm Finder</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center space-x-2 sm:space-x-4 justify-end">
          <Button variant="ghost" asChild size="sm">
            <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer">
              TradingView
            </a>
          </Button>
          <Button variant="ghost" asChild size="sm">
            <a href="https://www.investopedia.com" target="_blank" rel="noopener noreferrer">
              Investopedia
            </a>
          </Button>
          <Button variant="ghost" asChild size="sm">
            <a href="https://www.babypips.com" target="_blank" rel="noopener noreferrer">
              Babypips
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
