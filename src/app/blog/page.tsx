'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import type { BlogPost } from '@/lib/types';
import { format } from 'date-fns';

export default function BlogPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const blogPostsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'blogPosts'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: posts, isLoading } = useCollection<BlogPost>(blogPostsQuery);

  const categories = useMemo(() => {
    if (!posts) return [];
    return [...new Set(posts.map(p => p.category))];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return (posts || [])
      .filter(post => {
        if (activeCategory && post.category !== activeCategory) {
          return false;
        }
        if (searchTerm && !post.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        return true;
      });
  }, [posts, searchTerm, activeCategory]);

  return (
    <>
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 font-headline">The Blog</h1>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-lg">
              Insights, news, and updates from the world of trading.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search articles..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={activeCategory === null ? 'default' : 'outline'}
                onClick={() => setActiveCategory(null)}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={activeCategory === category ? 'default' : 'outline'}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoading && Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
            {!isLoading && filteredPosts.map(post => (
              <Link href={`/blog/${post.slug}`} key={post.id}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <span>{format(post.createdAt.toDate(), 'MMMM d, yyyy')}</span>
                        <span>&middot;</span>
                        <span>By {post.author}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">{post.category}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {!isLoading && filteredPosts.length === 0 && (
            <div className="text-center col-span-full py-16">
              <p className="text-muted-foreground">No posts found. Try a different search or filter.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
