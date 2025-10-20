
'use client';
import { ReactNode, Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LoadingProvider, useLoading } from '@/context/loading-context';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { SidebarProvider } from '@/context/sidebar-context';

function RouteChangeListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setIsLoading } = useLoading();

  useEffect(() => {
    // When the route changes, we assume loading is finished on the new page.
    // Pages that need to load data will immediately set it back to true.
    setIsLoading(false);
  }, [pathname, searchParams, setIsLoading]);

  return null;
}

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <LoadingProvider>
            <FirebaseClientProvider>
                <SidebarProvider>
                    <Suspense fallback={null}>
                        <RouteChangeListener />
                    </Suspense>
                    {children}
                </SidebarProvider>
            </FirebaseClientProvider>
        </LoadingProvider>
    )
}
