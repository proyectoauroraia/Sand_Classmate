import { AuthTabs } from '@/components/auth/auth-tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center bg-primary/20 text-primary p-4 rounded-2xl">
                 <svg
                    width="100"
                    height="100"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    >
                    <path
                        d="M-1.5 73.5C22.5 71 42 56 52 40.5C62 25 81.5 -1.5 101.5 1.5V101.5H-1.5V73.5Z"
                        fill="currentColor"
                        fillOpacity="0.6"
                    />
                    <path
                        d="M-1.5 83C21.5 79.8333 45.3 80.5 54 90C62.7 99.5 86.5 102.5 101.5 101.5V1.5C81.5 -1.5 62 25 52 40.5C42 56 22.5 71 -1.5 73.5V83Z"
                        fill="currentColor"
                    />
                </svg>
              </div>
            <h1 className="text-4xl font-bold tracking-tighter text-foreground">Sand Classmate</h1>
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
