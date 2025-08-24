
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState("es");

    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-card lg:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-[60px] items-center border-b px-6">
                        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                            <Logo />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto py-4">
                        <nav className="grid items-start px-4 text-sm font-medium">
                            <Link href="/dashboard" className="flex items-center gap-4 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary hover:bg-accent/60">
                                <Home className="h-5 w-5" />
                                Inicio
                            </Link>
                            <Link href="/dashboard/history" className="flex items-center gap-4 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary hover:bg-accent/60">
                                <History className="h-5 w-5" />
                                Mi Historial
                            </Link>
                            <Link href="/dashboard/settings" className="flex items-center gap-4 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary hover:bg-accent/60">
                                <Settings className="h-5 w-5" />
                                Configuración
                            </Link>
                        </nav>
                    </div>
                    <div className="mt-auto p-4 border-t">
                        <div className="flex items-center gap-4">
                             <Avatar className="h-10 w-10">
                                <AvatarImage src="https://placehold.co/40x40.png" alt="@prof" data-ai-hint="person face" />
                                <AvatarFallback>PD</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">Profesor Doe</span>
                                <span className="text-xs text-muted-foreground">Plan Premium</span>
                            </div>
                            <Button variant="ghost" size="icon" className="ml-auto" asChild>
                                <Link href="/">
                                    <LogOut className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
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
    );
}
