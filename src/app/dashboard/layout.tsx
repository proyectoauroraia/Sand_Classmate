
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, UserCircle2, Gem, Power, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Logo } from '@/components/logo';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ThemeSwitcher } from '@/components/theme-switcher';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const navLinks = [
        { href: "/dashboard", icon: Home, label: "Inicio" },
        { href: "/dashboard/history", icon: BookOpen, label: "Mi Biblioteca" },
        { href: "/dashboard/profile", icon: UserCircle2, label: "Mi Perfil" },
        { href: "/dashboard/pricing", icon: Gem, label: "Planes" },
    ];
    
    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    }

    const sidebarContent = (
        <div className="flex h-full max-h-screen flex-col gap-2 text-card-foreground">
            <div className="flex h-[60px] items-center border-b px-6">
                 <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-foreground">
                    <Logo />
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                         <Link 
                            key={link.href} 
                            href={link.href} 
                            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary ${isActive ? 'bg-accent text-accent-foreground font-semibold' : ''}`}
                         >
                            <link.icon className="h-5 w-5" />
                            {link.label}
                        </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t space-y-4">
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
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="ml-auto flex-shrink-0" onClick={handleSignOut}>
                                    <Power className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Cerrar Sesión</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );

    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[240px_1fr]">
            <div className="hidden border-r bg-muted lg:block">
                {sidebarContent}
            </div>
            <div className="flex flex-col">
                 <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted px-6 lg:h-[60px] lg:justify-end">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0 bg-muted border-r-0">
                            {sidebarContent}
                        </SheetContent>
                    </Sheet>
                     <div className="w-full flex-1">
                        {/* Header content can go here, e.g. search bar */}
                    </div>

                    <ThemeSwitcher />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="https://placehold.co/40x40.png" alt="@prof" data-ai-hint="person face" />
                                    <AvatarFallback>PD</AvatarFallback>
                                </Avatar>
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                                <UserCircle2 className="mr-2 h-4 w-4" />
                                Mi Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                                <Settings className="mr-2 h-4 w-4" />
                                Configuración
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={handleSignOut}>
                                <Power className="mr-2 h-4 w-4" />
                                Cerrar Sesión
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </header>
                 <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-12 bg-background">
                    {children}
                </main>
            </div>
        </div>
    );
}
