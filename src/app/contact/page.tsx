import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | Prop Firm Check',
    description: 'Get in touch with Prop Firm Check.',
};

export default function ContactPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-headline">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                <p>If you have any questions, comments, or suggestions, please feel free to reach out to us. We value your feedback and are always looking to improve our platform.</p>
                <p>You can contact us via email at: <a href="mailto:propfirmcheck101@gmail.com" className="text-primary hover:underline">propfirmcheck101@gmail.com</a></p>
                <p>We aim to respond to all inquiries within 48 business hours.</p>
            </CardContent>
        </Card>
    );
}
