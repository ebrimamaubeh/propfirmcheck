
'use client';
import { useEffect, useState, Suspense } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '@/lib/types';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLoading } from '@/context/loading-context';
import ReactMarkdown from 'react-markdown';

export default function BlogPostDetails() {
  const { slug } = useParams() as { slug: string };
  const firestore = useFirestore();
  const { setIsLoading: setAppIsLoading, setIsLoading } = useLoading();

  const handleLinkClick = () => {
    setIsLoading(true);
  }

  const postQuery = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    return query(collection(firestore, 'blogPosts'), where('slug', '==', slug), limit(1));
  }, [firestore, slug]);
  
  const { data: posts, isLoading } = useCollection<BlogPost>(postQuery);
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);

  useEffect(() => {
    setAppIsLoading(isLoading);
  }, [isLoading, setAppIsLoading]);

  useEffect(() => {
    if (!isLoading) {
      setPost(posts?.[0]);
    }
  }, [posts, isLoading]);

  if (isLoading || post === undefined) {
    return null; // Global loading spinner is active
  }

  if (post === null) {
    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold">Post Not Found</h2>
            <p className="text-muted-foreground">We couldn't find the blog post you were looking for.</p>
            <Button asChild className="mt-4">
                <Link href="/blog">Back to Blog</Link>
            </Button>
        </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    datePublished: post.createdAt ? post.createdAt.toDate().toISOString() : new Date().toISOString(),
    dateModified: post.updatedAt ? post.updatedAt.toDate().toISOString() : new Date().toISOString(),
    description: post.content.substring(0, 160), // First 160 chars as a snippet
    // image: "URL_to_an_image_if_available", // TODO: Add image to blog post schema
    publisher: {
      '@type': 'Organization',
      name: 'Prop Firm Check',
      // logo: {
      //   '@type': 'ImageObject',
      //   'url': 'URL_to_logo'
      // }
    },
    mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://your-domain-here.com/blog/${post.slug}` // Replace with your domain
    }
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <div className="flex justify-center">
          <article className="w-full max-w-4xl">
              <div className="mb-8">
                  <Button asChild variant="outline">
                  <Link href="/blog" onClick={handleLinkClick}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Blog
                  </Link>
                  </Button>
              </div>
              <header className="mb-8 text-center">
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 font-headline">{post.title}</h1>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-muted-foreground">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span>{post.createdAt ? format(post.createdAt.toDate(), 'MMMM d, yyyy') : ''}</span>
                      <span>by {post.author}</span>
                  </div>
              </header>
              
              <Card>
                  <CardContent className="py-6">
                      <div className="prose prose-lg dark:prose-invert max-w-none mx-auto">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                      </div>
                  </CardContent>
              </Card>

          </article>
      </div>
    </>
  );
}
