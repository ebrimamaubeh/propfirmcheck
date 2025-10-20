'use client'
import { useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import PropFirmTable from '@/components/prop-firm-table';
import type { PropFirm } from '@/lib/types';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useLoading } from '@/context/loading-context';

export default function Home() {
  const firestore = useFirestore();
  const { setIsLoading } = useLoading();

  const firmsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'prop_firms'));
  }, [firestore]);
  
  const { data: firms, isLoading } = useCollection<PropFirm>(firmsQuery);

  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading, setIsLoading]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="py-12 md:py-20 bg-card">
          <div className="container text-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 font-headline">The Prop Firm That Best Matches You</h1>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-lg">
              We've compiled and reviewed the best proprietary trading firms to help you find the perfect fit for your trading style and goals.
            </p>
          </div>
        </section>

        <section className="container py-12 md:py-20">
          {isLoading || !firms ? (
            null
          ) : (
            <PropFirmTable firms={firms} />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
