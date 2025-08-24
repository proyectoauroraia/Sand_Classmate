
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Home, Library, Settings, LogOut, Gem } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

    return (
        <TooltipProvider delayDuration={0}>
            <div className="grid min-h-screen w-full lg:grid-cols-[80px_1fr]">
                <div className="hidden border-r bg-card lg:flex lg:flex-col lg:items-center">
                    <div className="flex h-[60px] w-full items-center justify-center border-b">
                        <Link href="/dashboard" className="flex items-center justify-center gap-2 font-semibold">
                           <Logo />
                        </Link>
                    </div>
                    <nav className="flex flex-col items-center gap-4 px-2 py-4 flex-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/dashboard" className="flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary hover:bg-accent/60">
                                    <Home className="h-6 w-6" />
                                    <span className="sr-only">Inicio</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">Inicio</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/dashboard/history" className="flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary hover:bg-accent/60">
                                    <Library className="h-6 w-6" />
                                    <span className="sr-only">Mi Biblioteca</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">Mi Biblioteca</TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/dashboard/pricing" className="flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary hover:bg-accent/60">
                                    <Gem className="h-6 w-6" />
                                    <span className="sr-only">Planes</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">Planes</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/dashboard/settings" className="flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary hover:bg-accent/60">
                                    <Settings className="h-6 w-6" />
                                    <span className="sr-only">Configuración</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">Configuración</TooltipContent>
                        </Tooltip>
                    </nav>
                    <div className="mt-auto flex flex-col items-center gap-4 p-4 border-t">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                 <Avatar className="h-10 w-10">
                                    <AvatarImage src="https://placehold.co/40x40.png" alt="@prof" data-ai-hint="person face" />
                                    <AvatarFallback>PD</AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <div>
                                    <p className="font-semibold">Professor Doe</p>
                                    <p className="text-muted-foreground">Plan Premium</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href="/">
                                        <LogOut className="h-6 w-6" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Cerrar Sesión</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
                <div className="flex flex-col bg-background">
                     <main className="flex-1 p-4 md:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
