
import { Suspense } from 'react';
import type { Metadata } from 'next';
import FirmDetails from '@/components/firm-details';

// This function can't be in a client component.
// This page.tsx is now a Server Component that renders a Client Component.
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = params.id;
  const firmName = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${firmName} | Prop Firm Review`,
    description: `Detailed review, rules, and information for ${firmName}. Find out if it's the right prop firm for you.`,
    alternates: {
      canonical: `/firm/${id}`,
    },
  };
}

export default function FirmDetailsPage() {
    return (
        <Suspense fallback={null}>
            <FirmDetails />
        </Suspense>
    );
}
