
'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser, initiateEmailSignIn, initiateEmailSignUp } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { useLoading } from '@/context/loading-context';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function AdminLoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { setIsLoading } = useLoading();
  const [email, setEmail] = useState('jallowebrima7@gmail.com');
  const [password, setPassword] = useState('Lhooq123!');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    setIsLoading(isUserLoading);
  }, [isUserLoading, setIsLoading]);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/admin/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = async () => {
    if (!auth) return;
    setIsSigningIn(true);
    // Don't set global loading, as the redirect will be handled by the auth listener
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener in the provider will handle the redirect
    } catch (error) {
      const firebaseError = error as FirebaseError;
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          toast({
            title: 'Admin Account Created',
            description: "Your admin account has been created. You are now logged in.",
          });
          // The onAuthStateChanged listener will handle the redirect
        } catch (creationError) {
          const creationFirebaseError = creationError as FirebaseError;
          toast({
            variant: 'destructive',
            title: 'Creation Failed',
            description: creationFirebaseError.message || 'Could not create admin account.',
          });
          setIsSigningIn(false);
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: firebaseError.message || 'An unexpected error occurred.',
        });
        setIsSigningIn(false);
      }
    }
    // No need for finally block to set isSigningIn to false, as successful login leads to unmount
  };

  if (isUserLoading || user) {
    return null; // Global loading spinner will be shown
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Admin Login</CardTitle>
        <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
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
              onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
            />
          </div>
          <Button onClick={handleSignIn} className="w-full" disabled={isSigningIn}>
            {isSigningIn ? 'Signing In...' : 'Sign In'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
