
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { GoogleIcon } from '@/components/icons/google-icon';
import { createClient } from '@/lib/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

// Helper to parse Supabase error messages
const getFriendlyErrorMessage = (message: string): string => {
    if (message.includes("Invalid login credentials")) {
        return "Email o contraseña incorrectos. Por favor, verifica tus datos.";
    }
    if (message.includes("User already registered")) {
        return "Ya existe una cuenta con este correo electrónico. Intenta iniciar sesión.";
    }
    if (message.includes("Unsupported provider: provider is not enabled")) {
        return "El inicio de sesión con Google no está habilitado en el servidor. Contacta a soporte.";
    }
    try {
      // For JSON-like error strings from Supabase Auth
      const parsed = JSON.parse(message);
      return parsed.msg || "Ocurrió un error inesperado.";
    } catch(e) {
      // Fallback for regular string messages
      return message;
    }
}


export function AuthTabs() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
                 data: {
                    full_name: 'Nuevo Usuario',
                    role: 'user',
                }
            },
        });
        if (error) throw error;
        router.push('/confirm-email');
    } catch (error: any) {
        console.error("Authentication Error:", error);
        setError(getFriendlyErrorMessage(error.message));
    } finally {
        setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
    } catch (error: any) {
        console.error("Authentication Error:", error);
        setError(getFriendlyErrorMessage(error.message));
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        },
      });
      if (error) throw error;
      // The user will be redirected to Google, so no need to push route here.
    } catch(error: any) {
      console.error("Google Sign-In Error:", error);
      setError(getFriendlyErrorMessage(error.message));
      setLoading(false); // Stop loading only if there's an error before redirect
    } 
    // No finally block to set loading to false, as the page should redirect.
  };

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de Autenticación</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <TabsContent value="login">
        <form onSubmit={handleSignIn}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-login">Email</Label>
              <Input id="email-login" type="email" placeholder="professor@university.edu" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-login">Password</Label>
              <Input id="password-login" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
            <div className="relative my-2">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">OR</span>
            </div>
            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" type="button" disabled={loading}>
               <GoogleIcon className="mr-2" />
               Sign in with Google
            </Button>
          </div>
        </form>
      </TabsContent>
      <TabsContent value="signup">
        <form onSubmit={handleSignUp}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-signup">Email</Label>
              <Input id="email-signup" type="email" placeholder="professor@university.edu" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-signup">Password</Label>
              <Input id="password-signup" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
            <div className="relative my-2">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">OR</span>
            </div>
            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" type="button" disabled={loading}>
              <GoogleIcon className="mr-2" />
              Sign up with Google
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  );
}
