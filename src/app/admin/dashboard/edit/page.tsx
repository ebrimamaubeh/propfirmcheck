'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { BlogPost } from '@/lib/types';
import { useLoading } from '@/context/loading-context';

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

function EditPostForm() {
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const postId = searchParams.get('id');
    
    const firestore = useFirestore();
    const { toast } = useToast();
    const { setIsLoading } = useLoading();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [author, setAuthor] = useState('');
    const [slug, setSlug] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    
    const postRef = useMemoFirebase(() => {
        if (!firestore || !postId) return null;
        return doc(firestore, 'blogPosts', postId);
    }, [firestore, postId]);
    
    const { data: post, isLoading: isPostLoading } = useDoc<BlogPost>(postRef);

    useEffect(() => {
        setIsLoading(isUserLoading || (postId && isPostLoading));
    }, [isUserLoading, postId, isPostLoading, setIsLoading]);

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content);
            setCategory(post.category);
            setAuthor(post.author);
            setSlug(post.slug);
        }
    }, [post]);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/admin/login');
        }
    }, [isUserLoading, user, router]);

    if (isUserLoading || (postId && isPostLoading)) {
        return null; // The global loading spinner will be shown
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        if (!postId) { // Only auto-slugify for new posts
            setSlug(slugify(e.target.value));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore) return;
        setIsSaving(true);
        setIsLoading(true);
        
        const postData = {
            title,
            slug,
            content,
            category,
            author,
            updatedAt: serverTimestamp(),
        };

        try {
            if (postId) {
                const docRef = doc(firestore, 'blogPosts', postId);
                await setDoc(docRef, postData, { merge: true });
                toast({ title: "Success", description: "Post updated successfully." });
            } else {
                const collectionRef = collection(firestore, 'blogPosts');
                await addDoc(collectionRef, {
                    ...postData,
                    createdAt: serverTimestamp(),
                });
                toast({ title: "Success", description: "Post created successfully." });
            }
            router.push('/admin/dashboard');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Failed to save post: ${error.message}`
            });
        } finally {
            setIsSaving(false);
            setIsLoading(false);
        }
    };

    return (
        <main className="flex-1 py-12 md:py-20">
            <div className="container max-w-3xl">
                <Card>
                    <CardHeader>
                        <CardTitle>{postId ? 'Edit Post' : 'Create New Post'}</CardTitle>
                        <CardDescription>Fill out the form below to save your blog post.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" value={title} onChange={handleTitleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">URL Slug</Label>
                                <Input id="slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="author">Author</Label>
                                <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Content (HTML)</Label>
                                <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required rows={15} />
                            </div>
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Post'}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

export default function EditPostPage() {
    return (
        <>
            <Header />
            <Suspense fallback={null}>
                <EditPostForm />
            </Suspense>
            <Footer />
        </>
    );
}
