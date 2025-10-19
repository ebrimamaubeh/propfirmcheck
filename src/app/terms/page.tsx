import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | Prop Firm Finder',
    description: 'Read the terms of service for Prop Firm Finder.',
};

export default function TermsPage() {
    return (
        <>
            <Header />
            <main className="flex-1 py-12 md:py-20">
                <div className="container max-w-3xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl font-headline">Terms of Service</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                            <p>By accessing this website, you are agreeing to be bound by these website Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
                            <h4 className="font-semibold text-foreground pt-4">1. Use License</h4>
                            <p>Permission is granted to temporarily download one copy of the materials (information or software) on Prop Firm Finder's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
                            <h4 className="font-semibold text-foreground pt-4">2. Limitations</h4>
                            <p>In no event shall Prop Firm Finder or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Prop Firm Finder's website.</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </>
    );
}
