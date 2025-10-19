import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import propFirmsData from '@/lib/prop-firms-data.json';
import type { PropFirm } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpRight, CheckCircle } from 'lucide-react';
import StarRating from '@/components/star-rating';
import CopyButton from '@/components/copy-button';

type Props = {
  params: { id: string };
};

const firms: PropFirm[] = propFirmsData;

export function generateStaticParams() {
  return firms.map((firm) => ({
    id: firm.id,
  }));
}

export function generateMetadata({ params }: Props): Metadata {
  const firm = firms.find((p) => p.id === params.id);
  if (!firm) {
    return {
      title: 'Firm Not Found',
    };
  }
  return {
    title: `${firm.name} | Prop Firm Details`,
    description: `Rules, platforms, and promo code for ${firm.name}.`,
  };
}

export default function FirmDetailsPage({ params }: Props) {
  const firm = firms.find((p) => p.id === params.id);

  if (!firm) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-headline">{firm.name}</CardTitle>
                  <CardDescription>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <StarRating rating={firm.review.rating} />
                      <span className="text-sm text-muted-foreground">{firm.review.rating}/5 ({firm.review.count} reviews)</span>
                      <Badge variant="secondary">{firm.type} Firm</Badge>
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
            </div>

            <div className="space-y-6">
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
                        <span className="font-mono text-lg font-bold text-primary">{firm.promoCode}</span>
                        <CopyButton textToCopy={firm.promoCode} />
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
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
