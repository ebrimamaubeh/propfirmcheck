'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import type { BlogPost } from '@/lib/types';
import { format } from 'date-fns';
import { useLoading } from '@/context/loading-context';
import { BlogLayout } from '@/components/layout/blog-layout';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function BlogPage() {
  const firestore = useFirestore();
  const { setIsLoading } = useLoading();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleLinkClick = () => {
    setIsLoading(true);
  }

  const blogPostsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'blogPosts'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: posts, isLoading } = useCollection<BlogPost>(blogPostsQuery);

  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading, setIsLoading]);

  const categories = useMemo(() => {
    if (!posts) return [];
    const allCategories = ['All', ...new Set(posts.map(p => p.category))];
    return allCategories;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter(post => {
      const categoryMatch = activeCategory ? post.category === activeCategory : true;
      const searchMatch = searchTerm ? post.title.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      return categoryMatch && searchMatch;
    });
  }, [posts, searchTerm, activeCategory]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category === 'All' ? null : category);
  };

  const blogPostImages = PlaceHolderImages.slice(1, 4);

  return (
    <BlogLayout
      categories={categories}
      activeCategory={activeCategory || 'All'}
      onCategoryChange={handleCategoryChange}
    >
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 font-headline">The Blog</h1>
        <p className="max-w-2xl mx-auto text-muted-foreground md:text-lg">
          Insights, news, and updates from the world of trading.
        </p>
      </div>

      <div className="relative w-full mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search articles..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        null
      ) : filteredPosts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {filteredPosts.map((post, index) => {
             const image = blogPostImages[index % blogPostImages.length];
             return (
              <Link href={`/blog/${post.slug}`} key={post.id} onClick={handleLinkClick} className="group">
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                  {image && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={image.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={image.imageHint}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">{post.category}</Badge>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <span>{post.createdAt ? format(post.createdAt.toDate(), 'MMMM d, yyyy') : '...'}</span>
                        <span>&middot;</span>
                        <span>By {post.author}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
             )
            })}
        </div>
      ) : (
        <div className="text-center col-span-full py-16">
          <p className="text-muted-foreground">No posts found. Try a different search or filter.</p>
        </div>
      )}
    </BlogLayout>
  );
}
