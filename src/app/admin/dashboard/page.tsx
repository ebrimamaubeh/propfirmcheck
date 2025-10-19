'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, deleteDoc, doc, writeBatch, serverTimestamp, getDocs, addDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { BlogPost, PropFirm } from '@/lib/types';
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
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from 'react';
import PropFirmForm from '@/components/prop-firm-form';
import propFirmsData from '@/lib/prop-firms-data.json';

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
  const { data: posts, isLoading: isPostsLoading } = useCollection<BlogPost>(blogPostsQuery);

  const propFirmsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'prop_firms'), orderBy('name', 'asc'));
  }, [firestore]);
  const { data: firms, isLoading: isFirmsLoading } = useCollection<PropFirm>(propFirmsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/admin/login');
    }
  }, [isUserLoading, user, router]);

  const seedBlogPosts = async () => {
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
            description: 'Failed to seed blog posts: ' + error.message,
        });
    }
  };

  const seedPropFirms = async () => {
    if (!firestore) return;
    try {
        const firmsCollection = collection(firestore, 'prop_firms');
        const existingFirmsSnap = await getDocs(firmsCollection);
        if(!existingFirmsSnap.empty) {
          toast({ title: 'Info', description: 'Prop firms collection is not empty. Seeding aborted.' });
          return;
        }

        const batch = writeBatch(firestore);
        propFirmsData.forEach((firm: any) => {
            const docRef = doc(firmsCollection, firm.id);
            batch.set(docRef, firm);
        });

        await batch.commit();
        toast({
            title: 'Success',
            description: 'Prop firms have been seeded from JSON file.',
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to seed prop firms: ' + error.message,
        });
    }
  };

  const deleteBlogPost = async (postId: string) => {
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

  const deletePropFirm = async (firmId: string) => {
    if (!firestore) return;
    try {
        await deleteDoc(doc(firestore, 'prop_firms', firmId));
        toast({
            title: 'Success',
            description: 'Prop firm deleted successfully.',
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to delete prop firm: ' + error.message,
        });
    }
  };

  const handleAddPropFirm = async (firmData: Omit<PropFirm, 'id'>) => {
    if (!firestore) return;
    try {
        const collectionRef = collection(firestore, 'prop_firms');
        const newDocRef = doc(collectionRef, slugify(firmData.name));
        await addDoc(collectionRef, firmData);
        toast({ title: "Success", description: "Prop firm added successfully." });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: `Failed to add prop firm: ${error.message}`
        });
    }
  };


  if (isUserLoading || isPostsLoading || isFirmsLoading || (!user && !isUserLoading)) {
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
              <p className="text-muted-foreground">Manage your content here.</p>
            </div>
            {auth && <Button variant="outline" onClick={() => auth.signOut()}>Sign Out</Button>}
          </div>

          <Tabs defaultValue="blog">
              <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="blog">Blog Posts</TabsTrigger>
                  <TabsTrigger value="firms">Prop Firms</TabsTrigger>
              </TabsList>
              <TabsContent value="blog">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Blog Posts</CardTitle>
                            <CardDescription>A list of all blog posts in your database.</CardDescription>
                        </div>
                        <Button asChild>
                            <Link href="/admin/dashboard/edit">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Post
                            </Link>
                        </Button>
                    </div>
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
                                      <AlertDialogAction onClick={() => deleteBlogPost(post.id)}>Continue</AlertDialogAction>
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
                              <Button onClick={seedBlogPosts}>Add Sample Posts</Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="firms">
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Prop Firm</CardTitle>
                    <CardDescription>Fill out the form to add a new prop firm.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PropFirmForm onSubmit={handleAddPropFirm} />
                  </CardContent>
                </Card>
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Existing Prop Firms</CardTitle>
                    <CardDescription>A list of all prop firms in your database.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {firms && firms.length > 0 ? (
                          firms.map(firm => (
                            <TableRow key={firm.id}>
                              <TableCell className="font-medium">{firm.name}</TableCell>
                              <TableCell><Badge variant="secondary">{firm.type}</Badge></TableCell>
                              <TableCell className="text-right">
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
                                        This action cannot be undone. This will permanently delete the prop firm.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deletePropFirm(firm.id)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                              <p className="mb-4">No prop firms yet.</p>
                              <Button onClick={seedPropFirms}>Seed from JSON</Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
}
