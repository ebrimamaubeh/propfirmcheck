import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import PropFirmTable from '@/components/prop-firm-table';
import propFirmsData from '@/lib/prop-firms-data.json';
import type { PropFirm } from '@/lib/types';

export default function Home() {
  const firms: PropFirm[] = propFirmsData;

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

        <section className="container py-12 md:py-20 flex justify-center">
          <PropFirmTable firms={firms} />
        </section>
      </main>
      <Footer />
    </>
  );
}
