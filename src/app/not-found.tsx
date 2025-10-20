
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLoading } from '@/context/loading-context';

export default function NotFound() {
  const { setIsLoading } = useLoading();

  const handleLinkClick = () => {
    setIsLoading(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="max-w-md">
        <h1 className="text-9xl font-bold text-primary tracking-tighter">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mt-4 mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          Sorry, we couldn&apos;t find the page you were looking for. It might have been moved, deleted, or maybe you just mistyped the URL.
        </p>
        <Button asChild>
          <Link href="/" onClick={handleLinkClick}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
