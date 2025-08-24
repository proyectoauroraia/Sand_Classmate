
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Home, History, Settings, LogOut, Languages, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState("es");

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
                                    <History className="h-6 w-6" />
                                    <span className="sr-only">Mi Historial</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">Mi Historial</TooltipContent>
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
                            <TooltipContent side="right">Profesor Doe</TooltipContent>
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
                    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-card px-6">
                        <div className="flex items-center gap-2 lg:hidden">
                            <Logo />
                        </div>
                        <div className="w-full flex-1">
                            {/* This is dynamically updated by the page */}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                    <Languages className="h-4 w-4" />
                                    <span>{language === 'es' ? 'Español' : 'English'}</span>
                                    <ChevronDown className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Seleccionar idioma</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={language} onValueChange={setLanguage}>
                                    <DropdownMenuRadioItem value="es">Español</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </header>
                    <main className="flex-1 p-4 md:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
