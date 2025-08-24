import { AuthTabs } from '@/components/auth/auth-tabs';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-4 text-2xl font-bold text-foreground">Welcome Back, Educator</h1>
          <p className="text-muted-foreground">Sign in to generate your course materials in seconds.</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <AuthTabs />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
