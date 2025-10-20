import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us | Prop Firm Check',
    description: 'Learn more about Prop Firm Check and our mission.',
};

export default function AboutPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-headline">About Prop Firm Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                    Welcome to Prop Firm Check, your number one source for discovering and comparing proprietary trading firms. We're dedicated to giving you the very best information, with a focus on reliability, clarity, and usefulness.
                </p>
                <p>
                    Founded in {new Date().getFullYear()}, Prop Firm Check has come a long way from its beginnings. When we first started out, our passion for helping fellow traders find trustworthy funding partners drove us to create this resource, and gave us the impetus to turn hard work and inspiration into a booming online directory.
                </p>
                <p>
                    We now serve traders all over the world, and are thrilled to be a part of the fair and transparent wing of the online trading industry. We hope you enjoy our listings as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
                </p>
            </CardContent>
        </Card>
    );
}
