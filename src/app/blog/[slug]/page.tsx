'use client';
import { notFound, useParams } from 'next/navigation';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '@/lib/types';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useLoading } from '@/context/loading-context';
import ReactMarkdown from 'react-markdown';

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
    <div className="flex justify-center">
        <article className="w-full max-w-4xl">
            <div className="mb-8">
                <Button asChild variant="outline">
                <Link href="/blog">
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
  );
}
