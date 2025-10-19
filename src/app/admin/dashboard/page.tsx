'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
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

  if (isUserLoading || isLoading) {
    return <div>Loading dashboard...</div>;
  }

  if (!user) {
    router.replace('/admin/login');
    return null;
  }
  
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
              <Button variant="outline" onClick={() => auth.signOut()}>Sign Out</Button>
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
                  {posts && posts.map(post => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell><Badge variant="secondary">{post.category}</Badge></TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell>{format(post.createdAt.toDate(), 'PPpp')}</TableCell>
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
                  ))}
                </TableBody>
              </Table>
              {!posts?.length && <p className="text-center py-8 text-muted-foreground">No posts yet.</p>}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
