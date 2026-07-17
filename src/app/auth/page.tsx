"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from '@/hooks/use-toast';
import { Loader2, Clock, Mail, Lock, User as UserIcon } from 'lucide-react';

export default function AuthPage() {
  const auth = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/');
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({ variant: "destructive", title: "Required", description: "Email and password are required." });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast({ title: "Welcome Back", description: "Taking you to your dashboard." });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        if (formData.name) {
          await updateProfile(userCredential.user, { displayName: formData.name });
        }
        toast({ title: "Account Created", description: "Welcome to GlobalCue!" });
      }
      router.push('/');
    } catch (error: any) {
      console.error(error);
      let message = "Authentication failed.";
      if (error.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your current domain';
        message = `Domain "${domain}" is not authorized. Go to Firebase Console > Auth > Settings > Authorized Domains and add it.`;
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        message = "Invalid email or password.";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "Email is already in use. Try signing in instead.";
      }
      toast({ variant: "destructive", title: "Error", description: message });
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Success", description: "Signed in with Google." });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      let message = "Google authentication failed.";
      if (error.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        message = `Domain "${domain}" not authorized. Please add it to "Authorized domains" in your Firebase Console (Authentication > Settings).`;
      }
      toast({ variant: "destructive", title: "Error", description: message });
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({ variant: "destructive", title: "Email Required", description: "Please enter your email to reset your password." });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, formData.email);
      toast({ title: "Reset Sent", description: "Check your inbox for a password recovery link." });
    } catch (error) {
      toast({ variant: "destructive", title: "Reset Failed", description: "Could not send reset email." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-[100px]" />
      </div>

      <Card className="w-full max-w-md glass-panel relative z-10 border-white/5 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Clock className="w-7 h-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-bold text-white tracking-tighter">GlobalCue</CardTitle>
          <CardDescription>Master meeting times across the world.</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs defaultValue="login" onValueChange={(v) => setMode(v as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-6 h-11 bg-white/5">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      placeholder="Jane Doe" 
                      className="pl-10 h-11"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="name@company.com" 
                    className="pl-10 h-11"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  {mode === 'login' && (
                    <Button 
                      type="button" 
                      variant="link" 
                      className="p-0 h-auto text-[10px] text-muted-foreground hover:text-primary"
                      onClick={handleForgotPassword}
                    >
                      Forgot?
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="••••••••" 
                    className="pl-10 h-11"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 mt-4 font-headline">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                  mode === 'login' ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            type="button" 
            disabled={loading} 
            onClick={handleGoogleSignIn}
            className="w-full h-11 border-white/10 hover:bg-white/5 gap-3 font-headline"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google Account
              </>
            )}
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center pt-2 pb-6">
          <p className="text-[10px] text-muted-foreground text-center max-w-[200px] leading-relaxed">
            By continuing, you agree to GlobalCue's <span className="text-white cursor-pointer hover:underline">Terms of Service</span> and <span className="text-white cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
