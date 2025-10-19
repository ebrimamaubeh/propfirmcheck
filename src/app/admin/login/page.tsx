'use client';

import { useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FirebaseError } from 'firebase/app';

export default function AdminLoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('jallowebrima7@gmail.com');
  const [password, setPassword] = useState('Lhooq123!');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  if (isUserLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    router.replace('/admin/dashboard');
    return null;
  }

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin/dashboard');
    } catch (error) {
        const firebaseError = error as FirebaseError;
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: firebaseError.message || 'An unexpected error occurred.',
        });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Admin Account Created',
        description: "Your admin account has been created. You are now logged in.",
      });
      // The onAuthStateChanged listener in the provider will handle the redirect
    } catch (error) {
        const firebaseError = error as FirebaseError;
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: firebaseError.message || 'Could not create admin account.',
        });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  return (
    <>
      <Header />
      <div className="flex-1 flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard. If you are the first admin, create an account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleSignIn} className="w-full" disabled={isSigningIn || isCreatingAccount}>
                  {isSigningIn ? 'Signing In...' : 'Sign In'}
                </Button>
                <Button onClick={handleCreateAccount} variant="secondary" className="w-full" disabled={isSigningIn || isCreatingAccount}>
                  {isCreatingAccount ? 'Creating...' : 'Create Admin Account'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
