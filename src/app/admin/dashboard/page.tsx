'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, deleteDoc, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { BlogPost } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useEffect } from 'react';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const samplePosts = [
    {
      title: 'Getting Started with Futures Trading',
      content: 'Futures trading can be complex, but with the right foundation, you can navigate the markets. This post covers the basics of futures contracts, leverage, and risk management.\n\n## Understanding Futures\n\nA futures contract is a legal agreement to buy or sell a particular commodity or financial instrument at a predetermined price at a specified time in the future.',
      author: 'Admin',
      category: 'Futures',
    },
    {
      title: 'Forex vs Futures: Which is Right for You?',
      content: 'Deciding between Forex and Futures trading depends on your style, risk tolerance, and goals. \n\n## Key Differences\n\n- **Market Hours**: Forex is a 24/5 market, while futures have specific trading sessions.\n- **Regulation**: Futures are traded on centralized exchanges, offering more transparency.',
      author: 'Admin',
      category: 'Trading',
    },
    {
      title: 'Top 3 Mistakes to Avoid in Prop Trading',
      content: 'Proprietary trading offers incredible opportunities, but pitfalls exist. \n\n### 1. Overleveraging\n\nUsing too much leverage is the quickest way to blow an account. Always respect your risk parameters.\n\n### 2. Ignoring the Rules\n\nEvery prop firm has rules. Violating them means losing your funded account. Know them inside and out.',
      author: 'Admin',
      category: 'Prop Firms',
    },
].map(post => ({...post, slug: slugify(post.title)}));


export default function AdminDashboardPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const blogPostsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'blogPosts'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: posts, isLoading } = useCollection<BlogPost>(blogPostsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/admin/login');
    }
  }, [isUserLoading, user, router]);

  const seedDatabase = async () => {
    if (!firestore) return;
    try {
        const batch = writeBatch(firestore);
        const postsCollection = collection(firestore, 'blogPosts');
        
        samplePosts.forEach(post => {
            const docRef = doc(postsCollection);
            batch.set(docRef, { ...post, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        });

        await batch.commit();
        toast({
            title: 'Success',
            description: 'Sample blog posts have been added.',
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to seed database: ' + error.message,
        });
    }
  };

  const handleDelete = async (postId: string) => {
    if (!firestore) return;
    try {
        await deleteDoc(doc(firestore, 'blogPosts', postId));
        toast({
            title: 'Success',
            description: 'Blog post deleted successfully.',
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to delete post: ' + error.message,
        });
    }
  };

  if (isUserLoading || isLoading || (!user && !isUserLoading)) {
    return <div>Loading dashboard...</div>;
  }
  
  return (
    <>
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your blog posts here.</p>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild>
                <Link href="/admin/dashboard/edit">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Post
                </Link>
              </Button>
              {auth && <Button variant="outline" onClick={() => auth.signOut()}>Sign Out</Button>}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Posts</CardTitle>
              <CardDescription>A list of all blog posts in your database.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts && posts.length > 0 ? (
                    posts.map(post => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell><Badge variant="secondary">{post.category}</Badge></TableCell>
                        <TableCell>{post.author}</TableCell>
                        <TableCell>{post.createdAt ? format(post.createdAt.toDate(), 'PPpp') : 'Date not available'}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="icon">
                              <Link href={`/admin/dashboard/edit?id=${post.id}`}>
                                  <Edit className="h-4 w-4" />
                              </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the post.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(post.id)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <p className="mb-4">No posts yet.</p>
                        <Button onClick={seedDatabase}>Add Sample Posts</Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {posts && posts.length > 0 && (
                <div className="mt-4 flex justify-center">
                    <Button onClick={seedDatabase} variant="outline">Add More Sample Posts</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
