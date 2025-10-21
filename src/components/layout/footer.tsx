
'use client';
import Link from 'next/link';
import { useLoading } from '@/context/loading-context';
import { useState, useEffect } from 'react';

export function Footer() {
  const { setIsLoading } = useLoading();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleLinkClick = () => {
    setIsLoading(true);
  };

  return (
    <footer className="bg-secondary/50 border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4 font-headline">Prop Firm Check</h3>
            <p className="text-sm text-muted-foreground">Find the best prop firm for your trading journey.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground" onClick={handleLinkClick}>About Us</Link></li>
              <li><Link href="/disclaimer" className="text-sm text-muted-foreground hover:text-foreground" onClick={handleLinkClick}>Disclaimer</Link></li>
              <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground" onClick={handleLinkClick}>Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground" onClick={handleLinkClick}>Terms of Service</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground" onClick={handleLinkClick}>Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <p className="text-sm text-muted-foreground">Social media links to be added here.</p>
          </div>
        </div>
        <div className="mt-12 border-t pt-6 text-center">
          <p className="text-sm text-muted-foreground">&copy; {currentYear} Prop Firm Check. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
