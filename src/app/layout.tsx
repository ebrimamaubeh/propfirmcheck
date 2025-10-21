
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { LoadingProvider } from '@/context/loading-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MainLayout } from '@/components/layout/main-layout';
import { SidebarProvider } from '@/context/sidebar-context';
import { ClientProviders } from '@/components/layout/client-providers';

const VENDOR_NAME = 'Prop Firm Check';
const VENDOR_URL = 'https://your-domain.com'; // IMPORTANT: Replace with your domain

export const metadata: Metadata = {
  metadataBase: new URL(VENDOR_URL),
  title: {
    default: VENDOR_NAME,
    template: `%s | ${VENDOR_NAME}`,
  },
  description: 'The Prop firm that best matches you. We review and compare proprietary trading firms to help you find the perfect fit.',
  openGraph: {
    title: VENDOR_NAME,
    description: 'Find the best prop firm for your trading journey.',
    url: VENDOR_URL,
    siteName: VENDOR_NAME,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: VENDOR_NAME,
    description: 'Find the best prop firm for your trading journey.',
    // creator: '@your_twitter_handle', // TODO: Add twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background flex flex-col">
        <ClientProviders>
            <Header />
            <main className="flex-1 py-12 md:py-20">
              <MainLayout>
                {children}
              </MainLayout>
            </main>
            <Footer />
            <LoadingSpinner />
            <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
