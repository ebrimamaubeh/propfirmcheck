import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { LoadingProvider } from '@/context/loading-context';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Prop Firm Check',
  description: 'The Prop firm that best matches you',
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
        <LoadingProvider>
          <FirebaseClientProvider>
            <Header />
            <div className="flex-1 py-12 md:py-20">
              {children}
            </div>
            <Footer />
          </FirebaseClientProvider>
          <LoadingSpinner />
        </LoadingProvider>
        <Toaster />
      </body>
    </html>
  );
}
