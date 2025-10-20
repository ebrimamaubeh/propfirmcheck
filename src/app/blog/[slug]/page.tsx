'use client';
import { notFound, useParams } from 'next/navigation';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '@/lib/types';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useLoading } from '@/context/loading-context';

export default function BlogPostPage() {
  const { slug } = useParams() as { slug: string };
  const firestore = useFirestore();
  const { setIsLoading: setAppIsLoading } = useLoading();

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
    notFound();
  }

  return (
    <>
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-3xl">
          <div className="mb-8">
            <Button asChild variant="outline">
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
          <article>
            <header className="mb-8">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 font-headline">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
                <Badge variant="secondary">{post.category}</Badge>
                <span>{post.createdAt ? format(post.createdAt.toDate(), 'MMMM d, yyyy') : ''}</span>
                <span>by {post.author}</span>
              </div>
            </header>
            
            <Card>
                <CardContent className="py-6">
                    <div 
                      className="prose prose-lg dark:prose-invert max-w-none leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </CardContent>
            </Card>

          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
