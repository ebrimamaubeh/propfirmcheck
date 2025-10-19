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

// A simple markdown-to-html renderer
const Markdown = ({ content }: { content: string }) => {
  const htmlContent = content
    .split('\n')
    .map(line => {
      if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
      if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
      if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
      if (line.trim() === '') return '<br />';
      return `<p>${line}</p>`;
    })
    .join('');
  return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};


export default function BlogPostPage() {
  const { slug } = useParams() as { slug: string };
  const firestore = useFirestore();

  const postQuery = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    return query(collection(firestore, 'blogPosts'), where('slug', '==', slug), limit(1));
  }, [firestore, slug]);
  
  const { data: posts, isLoading } = useCollection<BlogPost>(postQuery);
  const post = posts?.[0];

  if (isLoading) {
    return (
        <>
            <Header />
            <main className="flex-1 py-12 md:py-20">
                <div className="container max-w-3xl">
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-6 w-1/2 mb-8" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                </div>
            </main>
            <Footer />
        </>
    );
  }

  if (!post) {
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
                <span>{format(post.createdAt.toDate(), 'MMMM d, yyyy')}</span>
                <span>by {post.author}</span>
              </div>
            </header>
            
            <Card>
                <CardContent className="py-6">
                    <div className="prose prose-lg dark:prose-invert max-w-none leading-relaxed">
                        <Markdown content={post.content} />
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
