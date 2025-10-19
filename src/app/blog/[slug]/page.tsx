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
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';

export default function BlogPostPage() {
  const { slug } = useParams() as { slug: string };
  const firestore = useFirestore();

  const postQuery = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    return query(collection(firestore, 'blogPosts'), where('slug', '==', slug), limit(1));
  }, [firestore, slug]);
  
  const { data: posts, isLoading } = useCollection<BlogPost>(postQuery);
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoading) {
      setPost(posts?.[0]);
    }
  }, [posts, isLoading]);

  if (isLoading || post === undefined) {
    return (
        <>
            <Header />
            <main className="flex-1 py-12 md:py-20">
                <div className="container max-w-3xl">
                    <div className="mb-8">
                        <Skeleton className="h-10 w-40" />
                    </div>
                    <Skeleton className="h-12 w-3/4 mb-4" />
                    <Skeleton className="h-6 w-1/2 mb-8" />
                    <Card>
                        <CardContent className="py-6 space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </>
    );
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
                    <div className="prose prose-lg dark:prose-invert max-w-none leading-relaxed">
                        <ReactMarkdown
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-4xl font-extrabold mt-10 mb-5" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-6 mb-3" {...props} />,
                            p: ({node, ...props}) => <p className="leading-relaxed my-4" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 my-4" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-4" {...props} />,
                            li: ({node, ...props}) => <li className="mb-2" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-muted-foreground/50 pl-4 italic my-4" {...props} />,
                            a: ({node, ...props}) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                          }}
                        >
                          {post.content}
                        </ReactMarkdown>
                    </div>
                </CardContent>
            </Card>

          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
