
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { GoogleIcon } from '@/components/icons/google-icon';

export function AuthTabs() {
  const router = useRouter();

  // This function can still be used for other auth providers like Google
  const handleAuthAction = () => {
    router.push('/dashboard');
  };

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email-login">Email</Label>
            <Input id="email-login" type="email" placeholder="professor@university.edu" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-login">Password</Label>
            <Input id="password-login" type="password" required />
          </div>
          <Button asChild className="w-full">
             <Link href="/dashboard">Login</Link>
          </Button>
          <div className="relative my-2">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">OR</span>
          </div>
          <Button onClick={handleAuthAction} variant="outline" className="w-full">
             <GoogleIcon className="mr-2" />
             Sign in with Google
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="signup">
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email-signup">Email</Label>
            <Input id="email-signup" type="email" placeholder="professor@university.edu" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-signup">Password</Label>
            <Input id="password-signup" type="password" required />
          </div>
           <Button asChild className="w-full">
             <Link href="/dashboard">Create Account</Link>
          </Button>
          <div className="relative my-2">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">OR</span>
          </div>
          <Button onClick={handleAuthAction} variant="outline" className="w-full">
            <GoogleIcon className="mr-2" />
            Sign up with Google
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
