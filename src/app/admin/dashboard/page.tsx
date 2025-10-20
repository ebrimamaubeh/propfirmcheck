
'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, deleteDoc, doc, writeBatch, serverTimestamp, getDocs, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Upload } from 'lucide-react';
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
import { useEffect, useState, useRef } from 'react';
import { useLoading } from '@/context/loading-context';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      content: '<h2>Understanding Futures</h2><p>Futures trading can be complex, but with the right foundation, you can navigate the markets. This post covers the basics of futures contracts, leverage, and risk management. A futures contract is a legal agreement to buy or sell a particular commodity or financial instrument at a predetermined price at a specified time in the future.</p>',
      author: 'Admin',
      category: 'Futures',
    },
    {
      title: 'Forex vs Futures: Which is Right for You?',
      content: '<h2>Key Differences</h2><p>Deciding between Forex and Futures trading depends on your style, risk tolerance, and goals.<ul><li><strong>Market Hours</strong>: Forex is a 24/5 market, while futures have specific trading sessions.</li><li><strong>Regulation</strong>: Futures are traded on centralized exchanges, offering more transparency.</li></ul></p>',
      author: 'Admin',
      category: 'Trading',
    },
    {
      title: 'Top 3 Mistakes to Avoid in Prop Trading',
      content: '<h3>1. Overleveraging</h3><p>Proprietary trading offers incredible opportunities, but pitfalls exist. Using too much leverage is the quickest way to blow an account. Always respect your risk parameters.</p><h3>2. Ignoring the Rules</h3><p>Every prop firm has rules. Violating them means losing your funded account. Know them inside and out.</p>',
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
  const { setIsLoading } = useLoading();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState('');
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleLinkClick = () => {
    setIsLoading(true);
  }

  const blogPostsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'blogPosts'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  const { data: posts, isLoading: isPostsLoading } = useCollection<BlogPost>(blogPostsQuery);

  const propFirmsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'prop_firms'), orderBy('name', 'asc'));
  }, [firestore]);
  const { data: firms, isLoading: isFirmsLoading, error } = useCollection<PropFirm>(propFirmsQuery);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/admin/login');
    }
  }, [isUserLoading, user, router]);

  useEffect(() => {
    setIsLoading(isUserLoading || isPostsLoading || isFirmsLoading);
  }, [isUserLoading, isPostsLoading, isFirmsLoading, setIsLoading]);

  const seedBlogPosts = async () => {
    if (!firestore) return;
    setIsLoading(true);
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
    } finally {
        setIsLoading(false);
    }
  };

  const deleteBlogPost = async (postId: string) => {
    if (!firestore) return;
    setIsLoading(true);
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
    } finally {
        setIsLoading(false);
    }
  };

  const deletePropFirm = async (firmId: string) => {
    if (!firestore) return;
    setIsLoading(true);
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
    } finally {
        setIsLoading(false);
    }
  };

  const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const firms = JSON.parse(e.target?.result as string) as Omit<PropFirm, 'id'>[];
        if (!Array.isArray(firms)) {
          throw new Error('JSON file must be an array of prop firms.');
        }
        if (firms.some(firm => !firm.name)) {
            throw new Error('All firms in the JSON file must have a "name" property.');
        }
        await bulkAddPropFirms(firms);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Invalid JSON file',
          description: error.message,
        });
      } finally {
        // Reset file input to allow re-uploading the same file
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  const bulkAddPropFirms = async (firms: Omit<PropFirm, 'id'>[]) => {
    if (!firestore) return;
    setIsLoading(true);
    let firmsAdded = 0;
    let firmsUpdated = 0;

    try {
      const batch = writeBatch(firestore);
      const firmsCollection = collection(firestore, 'prop_firms');
      
      for (const firm of firms) {
        const firmId = slugify(firm.name);
        const firmDataWithId = { ...firm, id: firmId };
        const docRef = doc(firmsCollection, firmId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Document exists, update it. Using set with merge is a robust way to update.
            batch.set(docRef, firmDataWithId, { merge: true });
            firmsUpdated++;
        } else {
            // Document does not exist, create it.
            batch.set(docRef, firmDataWithId);
            firmsAdded++;
        }
      }

      await batch.commit();

      let description = '';
      if(firmsAdded > 0) description += `${firmsAdded} firms created. `;
      if(firmsUpdated > 0) description += `${firmsUpdated} firms updated.`;
      if(description === '') description = 'No new firms to add or update.';
      
      toast({
        title: 'Bulk Import Complete',
        description: description,
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to bulk add prop firms: ' + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!user || !user.email || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to perform this action.' });
        return;
    }
    if (!password) {
        toast({ variant: 'destructive', title: 'Password Required', description: 'Please enter your password to confirm.' });
        return;
    }

    setIsBulkDeleting(true);
    setIsLoading(true);

    try {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        
        // Re-authentication successful, proceed with deletion
        const firmsCollection = collection(firestore, 'prop_firms');
        const firmsSnapshot = await getDocs(firmsCollection);
        const batch = writeBatch(firestore);

        firmsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        toast({ title: 'Success', description: 'All prop firm data has been deleted.' });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Action Failed',
            description: error.code === 'auth/wrong-password' ? 'Incorrect password.' : 'Could not complete the action: ' + error.message,
        });
    } finally {
        setIsBulkDeleting(false);
        setIsLoading(false);
        setPassword('');
        // This will close the dialog by re-evaluating the open prop
        const closeButton = document.getElementById('close-bulk-delete-dialog');
        closeButton?.click();
    }
  };

  if (isUserLoading || isPostsLoading || isFirmsLoading || (!user && !isUserLoading)) {
    return null; // The global loading spinner will be shown
  }
  
  return (
    <div className="container flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="hidden lg:block lg:col-span-1">
          {/* Left sidebar content goes here */}
        </aside>
        <main className="lg:col-span-10">
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
                            <Link href="/admin/dashboard/edit" onClick={handleLinkClick}>
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
                                    <Link href={`/admin/dashboard/edit?id=${post.id}`} onClick={handleLinkClick}>
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
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Prop Firms</CardTitle>
                            <CardDescription>A list of all prop firms in your database.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                           <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept=".json"
                              onChange={handleJsonUpload}
                            />
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4" />
                                Bulk Add via JSON
                            </Button>
                            <Button asChild>
                                <Link href="/admin/dashboard/firm/edit" onClick={handleLinkClick}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    New Firm
                                </Link>
                            </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Bulk Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete All Prop Firm Data?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This is a destructive and irreversible action. To confirm, please enter your password.
                                    </AlertDialogDescription>
                                    <div className="space-y-2 pt-2">
                                        <Label htmlFor="password-confirm">Password</Label>
                                        <Input
                                            id="password-confirm"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel id="close-bulk-delete-dialog" onClick={() => setPassword('')}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleBulkDelete} disabled={isBulkDeleting}>
                                        {isBulkDeleting ? 'Deleting...' : 'Delete All Data'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                           <TableHead>Rating</TableHead>
                           <TableHead>Review Count</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {firms && firms.length > 0 ? (
                          firms.map(firm => {
                            const firmTypes = Array.isArray(firm.type) ? firm.type : [firm.type];
                            return (
                                <TableRow key={firm.id}>
                                <TableCell className="font-medium">{firm.name}</TableCell>
                                <TableCell><div className="flex gap-1">{firmTypes.map(t => <Badge variant="secondary" key={t}>{t}</Badge>)}</div></TableCell>
                                <TableCell>{firm.review.rating}/5</TableCell>
                                <TableCell>{firm.review.count}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="ghost" size="icon">
                                        <Link href={`/admin/dashboard/firm/edit?id=${firm.id}`} onClick={handleLinkClick}>
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
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                              <p>No prop firms found.</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
          </Tabs>
        </main>
        <aside className="hidden lg:block lg:col-span-1">
          {/* Right sidebar content goes here */}
        </aside>
      </div>
    </div>
  );
}
