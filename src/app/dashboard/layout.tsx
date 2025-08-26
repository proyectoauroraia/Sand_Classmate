
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, UserCircle2, Gem, Power, Settings, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Logo } from '@/components/logo';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import type { User } from '@supabase/supabase-js';

// This layout is now only for protected routes like /history, /profile, etc.
// It enforces authentication.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
             if (event === 'SIGNED_OUT') {
                router.push('/');
            }
        });

        const checkInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        }
        checkInitialSession();


        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, router]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);


    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };
    
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!user) {
        return null;
    }

    const navLinks = [
        { href: "/", icon: Home, label: "Inicio" },
        { href: "/dashboard/history", icon: BookOpen, label: "Mi Biblioteca" },
        { href: "/dashboard/profile", icon: UserCircle2, label: "Mi Perfil" },
        { href: "/dashboard/pricing", icon: Gem, label: "Planes" },
    ];

    const sidebarContent = (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-[60px] items-center border-b px-6">
                 <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
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
        </div>
    );

    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[240px_1fr]">
            <div className="hidden border-r bg-card text-card-foreground lg:block">
                {sidebarContent}
            </div>
            <div className="flex flex-col">
                 <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-muted px-4 md:px-6 lg:h-[60px] lg:justify-end">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0 bg-card border-r-0">
                            {sidebarContent}
                        </SheetContent>
                    </Sheet>
                     <div className="w-full flex-1">
                        {/* Header content can go here, e.g. search bar */}
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.user_metadata?.avatar_url ?? 'https://placehold.co/40x40.png'} alt="@prof" data-ai-hint="person face" />
                                        <AvatarFallback>{user?.email?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
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
                    </div>

                </header>
                 <main className="flex-1 overflow-y-auto bg-background relative">
                    {children}
                </main>
            </div>
        </div>
    );
}
