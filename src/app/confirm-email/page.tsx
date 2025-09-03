
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck } from 'lucide-react';
import { DuneBackground } from '@/components/icons/dune-background';
import { Logo } from '@/components/logo';

export default function ConfirmEmailPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      <DuneBackground />
      <main className="flex flex-col items-center justify-center p-4 sm:p-8 z-10 w-full">
        <div className="w-full max-w-md">
           <div className="mx-auto mb-8">
                <Logo />
            </div>
          <Card className="shadow-2xl bg-card/80 backdrop-blur-sm border-border/20">
            <CardHeader className="text-center items-center">
              <MailCheck className="h-16 w-16 text-primary mb-4" />
              <CardTitle className="text-2xl">¡Revisa tu correo!</CardTitle>
              <CardDescription>
                Hemos enviado un enlace de confirmación a tu dirección de correo electrónico.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Por favor, haz clic en el enlace para completar tu registro y activar tu cuenta. Si no lo encuentras, revisa tu carpeta de spam.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
