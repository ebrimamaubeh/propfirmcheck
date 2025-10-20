
'use client'
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { PropFirm } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpRight, CheckCircle, ArrowLeft } from 'lucide-react';
import StarRating from '@/components/star-rating';
import CopyButton from '@/components/copy-button';
import { useLoading } from '@/context/loading-context';
import { useEffect } from 'react';

export default function FirmDetailsPage() {
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

  if (isLoading || firm === undefined) {
    return null;
  }
  
  if (firm === null) {
    return null;
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
            <CardTitle className="text-3xl font-headline">{firm.name}</CardTitle>
            <CardDescription>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <StarRating rating={firm.review.rating} />
                <span className="text-sm text-muted-foreground">{firm.review.rating}/5 ({firm.review.count} reviews)</span>
                <div className="flex gap-2">
                  {firm.type.map(t => <Badge variant="secondary" key={t}>{t} Firm</Badge>)}
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">In business for {firm.yearsInBusiness} years, offering up to ${firm.maxAllocation.toLocaleString()} in allocation.</p>
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
            <div>
              <h4 className="font-semibold mb-2">Promo Code</h4>
              <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
                  <span className="font-mono text-lg font-bold text-primary">CHECK</span>
                  <CopyButton textToCopy="CHECK" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button asChild size="lg" className="w-full">
          <a href={firm.referralLink} target="_blank" rel="noopener noreferrer">
            Visit {firm.name} <ArrowUpRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </>
  );
}
