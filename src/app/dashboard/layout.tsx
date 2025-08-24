import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Home, History, Settings, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
                                Dashboard
                            </Link>
                            <Link href="/dashboard/history" className="flex items-center gap-4 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary hover:bg-accent/60">
                                <History className="h-5 w-5" />
                                My History
                            </Link>
                            <Link href="/dashboard/settings" className="flex items-center gap-4 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary hover:bg-accent/60">
                                <Settings className="h-5 w-5" />
                                Settings
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
                                <span className="text-sm font-semibold">Professor Doe</span>
                                <span className="text-xs text-muted-foreground">Premium Plan</span>
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
                </header>
                <main className="flex-1 p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
