
'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { DuneBackground } from '@/components/icons/dune-background';
import { Logo } from '@/components/logo';
import { AuthTabs } from '@/components/auth/auth-tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Home() {
  return (
    <>
      <DuneBackground />
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-2xl text-center">
            <div className="mx-auto mb-8 flex justify-center">
                <Logo />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                Potencia tu Enseñanza con IA
            </h1>
            <p className="text-muted-foreground mt-4 text-lg md:text-xl max-w-xl mx-auto">
                Sube tu programa de estudios o apuntes y deja que la inteligencia artificial genere presentaciones, guías y evaluaciones para tus clases.
            </p>

            <Dialog>
                <DialogTrigger asChild>
                    <Button size="lg" className="mt-8 px-10 py-7 text-lg">Ingresar</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md p-0">
                     <Card className="shadow-none border-none">
                        <CardHeader className="text-center">
                            <DialogTitle className="text-2xl">Bienvenido a Sand Classmate</DialogTitle>
                            <DialogDescription>
                                Potencia tu enseñanza con inteligencia artificial.
                            </DialogDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <AuthTabs />
                        </CardContent>
                    </Card>
                </DialogContent>
            </Dialog>
        </div>
      </main>
    </>
  );
}
