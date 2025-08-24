
'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DuneBackground } from '@/components/icons/dune-background';
import { Logo } from '@/components/logo';
import { AuthTabs } from '@/components/auth/auth-tabs';


export default function Home() {
  return (
    <>
      <DuneBackground />
       <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-md">
            <div className="mx-auto mb-8">
                <Logo />
            </div>
            <Card className="shadow-2xl bg-card/80 backdrop-blur-sm border-border/20">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Bienvenido a Sand Classmate</CardTitle>
                    <CardDescription>
                        Potencia tu enseñanza con inteligencia artificial.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <AuthTabs />
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
