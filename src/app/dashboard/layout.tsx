
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, History, Settings, LogOut, Gem } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Logo } from '@/components/logo';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const navLinks = [
        { href: "/dashboard", icon: Home, label: "Inicio" },
        { href: "/dashboard/history", icon: History, label: "Mi Biblioteca" },
        { href: "/dashboard/pricing", icon: Gem, label: "Planes" },
        { href: "/dashboard/settings", icon: Settings, label: "Configuración" },
    ];

    const sidebarContent = (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-[60px] items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-foreground">
                    <Logo className="text-foreground" />
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {navLinks.map((link) => (
                         <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary hover:bg-accent/60">
                            <link.icon className="h-5 w-5" />
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t">
                <div className="flex items-center gap-4">
                     <Avatar className="h-10 w-10">
                        <AvatarImage src="https://placehold.co/40x40.png" alt="@prof" data-ai-hint="person face" />
                        <AvatarFallback>PD</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <p className="text-sm font-semibold">Professor Doe</p>
                        <p className="text-xs text-muted-foreground">Académico, Universidad de Chile</p>
                         <p className="text-xs text-muted-foreground">Santiago, Chile</p>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-auto flex-shrink-0" asChild>
                        <Link href="/">
                            <LogOut className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-card lg:block">
                {sidebarContent}
            </div>
            <div className="flex flex-col bg-background">
                <header className="flex h-14 items-center gap-4 border-b bg-card px-6 lg:h-[60px]">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0">
                            {sidebarContent}
                        </SheetContent>
                    </Sheet>
                     <div className="w-full flex-1">
                        {/* Header content can go here, e.g. search bar */}
                    </div>
                </header>
                 <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
