import { AuthTabs } from '@/components/auth/auth-tabs';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex items-center justify-center mb-6">
            <Image
              src="https://i.imgur.com/T0bC0fk.png"
              alt="Sand Classmate Logo"
              width={300}
              height={80}
              priority
            />
          </div>
          
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">Bienvenido de vuelta, Educador</h2>
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
