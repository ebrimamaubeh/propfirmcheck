import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Disclaimer | Prop Firm Check',
    description: 'Disclaimer for Prop Firm Check.',
};

export default function DisclaimerPage() {
    return (
        <>
            <Header />
            <main className="flex-1 py-12 md:py-20">
                <div className="container max-w-3xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl font-headline">Disclaimer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                            <p>The information provided by Prop Firm Check ("we," "us," or "our") on this website is for general informational purposes only. All information on the site is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.</p>
                            <p>This site may contain links to affiliate websites, and we receive an affiliate commission for any purchases made by you on the affiliate website using such links. Our affiliates include the prop firms listed.</p>
                            <p>Trading financial markets involves substantial risk and is not suitable for every investor. An investor could potentially lose all or more than the initial investment. Risk capital is money that can be lost without jeopardizing one's financial security or lifestyle. Only risk capital should be used for trading and only those with sufficient risk capital should consider trading.</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </>
    );
}
