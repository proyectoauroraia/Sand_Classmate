import { AuthTabs } from '@/components/auth/auth-tabs';
import { Logo } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-3xl font-bold text-primary">Sand Classmate</span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">Bienvenido de vuelta, Educador</h1>
          <p className="text-muted-foreground">Inicia sesión para generar los materiales de tu curso en segundos.</p>
        </div>
        <Card className="shadow-2xl shadow-primary/10">
          <CardContent className="p-6">
            <AuthTabs />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
