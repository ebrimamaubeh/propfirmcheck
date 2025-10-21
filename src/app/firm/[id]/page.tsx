
import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { PropFirm } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpRight, CheckCircle, ArrowLeft } from 'lucide-react';
import StarRating from '@/components/star-rating';
import CopyButton from '@/components/copy-button';

// Client-specific imports are now inside the client component
import { useParams } from 'next/navigation';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { useLoading } from '@/context/loading-context';
import { useEffect } from 'react';
import { doc } from 'firebase/firestore';


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


function FirmDetails() {
  'use client'
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { setIsLoading } = useLoading();

  const handleLinkClick = () => {
    setIsLoading(true);
  };

  const firmRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'prop_firms', id);
  }, [firestore, id]);

  const { data: firm, isLoading } = useDoc<PropFirm>(firmRef);

  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading, setIsLoading]);

  if (isLoading) {
    return null; // The global loading spinner is active
  }

  if (!firm) {
    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold">Firm Not Found</h2>
            <p className="text-muted-foreground">We couldn't find the firm you were looking for.</p>
            <Button asChild className="mt-4">
                <Link href="/">Back to List</Link>
            </Button>
        </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Button asChild variant="outline">
          <Link href="/" onClick={handleLinkClick}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Link>
        </Button>
      </div>
      <div className="space-y-8">
        <Card>
          <CardHeader>
             <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl font-headline">{firm.name}</CardTitle>
                <CardDescription>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <StarRating rating={firm.review.rating} />
                    <span className="text-sm text-muted-foreground">{firm.review.rating}/5 ({firm.review.count} reviews)</span>
                    <div className="flex gap-2">
                      {firm.type.map(t => <Badge variant="secondary" key={t}>{t}</Badge>)}
                    </div>
                  </div>
                </CardDescription>
              </div>
              <div className="shrink-0">
                <h4 className="font-semibold mb-2 text-right">Promo Code</h4>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
                    <span className="font-mono text-lg font-bold text-primary">CHECK</span>
                    <CopyButton textToCopy="CHECK" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">In business for {firm.yearsInBusiness} years, offering up to ${firm.maxAllocation.toLocaleString()} in allocation.</p>
             <Button asChild size="lg" className="w-full">
              <a href={firm.referralLink} target="_blank" rel="noopener noreferrer">
                Visit {firm.name} <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {firm.rules.map((rule) => (
                <li key={rule.title} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold">{rule.title}</p>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Trading Platforms</h4>
              <div className="flex flex-wrap gap-2">
                {firm.platform.map((p) => <Badge key={p}>{p}</Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </>
  );
}

export default function FirmDetailsPage() {
    return (
        <Suspense fallback={null}>
            <FirmDetails />
        </Suspense>
    );
}
