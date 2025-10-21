
'use client'
import { useEffect } from 'react';
import PropFirmTable from '@/components/prop-firm-table';
import type { PropFirm } from '@/lib/types';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useLoading } from '@/context/loading-context';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';

export default function Home() {
  const firestore = useFirestore();
  const { setIsLoading } = useLoading();
  const heroImage = PlaceHolderImages[0];

  const firmsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'prop_firms'));
  }, [firestore]);
  
  const { data: firms, isLoading } = useCollection<PropFirm>(firmsQuery);

  useEffect(() => {
    // This effect manages the global loading spinner state based on the hook's loading status.
    let spinnerTimeout: NodeJS.Timeout;
    let failsafeTimeout: NodeJS.Timeout;

    if (isLoading) {
      // Only show the spinner if loading takes longer than 200ms.
      // This prevents a brief "flash" of the spinner if data loads instantly from cache.
      spinnerTimeout = setTimeout(() => {
        setIsLoading(true);
      }, 200);

      // Failsafe: Ensure the spinner is turned off after 3 seconds, regardless of state.
      failsafeTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 3000);

    } else {
      // If loading is finished, immediately turn off the spinner.
      setIsLoading(false);
    }

    // Cleanup function to clear timeouts if the component unmounts
    // or if the dependencies (isLoading) change before the timeouts fire.
    return () => {
      clearTimeout(spinnerTimeout);
      clearTimeout(failsafeTimeout);
    };
  }, [isLoading, setIsLoading]);

  const scrollToTable = () => {
    const tableElement = document.getElementById('prop-firm-table');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section className="relative h-[60vh] -mt-12 md:-mt-20 flex items-center justify-center text-center text-white mb-12 rounded-lg overflow-hidden">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
            />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 font-headline drop-shadow-md">The Prop Firm That Best Matches You</h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-white/90 drop-shadow-sm mb-8">
            We've compiled and reviewed the best proprietary trading firms to help you find the perfect fit for your trading style and goals.
          </p>
          <Button size="lg" onClick={scrollToTable}>View Firms</Button>
        </div>
      </section>

      <section id="prop-firm-table">
        {isLoading && !firms ? (
          null
        ) : (
          <PropFirmTable firms={firms || []} />
        )}
      </section>
    </>
  );
}
