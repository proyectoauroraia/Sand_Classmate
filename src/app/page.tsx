
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, UserCircle2, Gem, Power, Settings, Loader2, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { AuthTabs } from '@/components/auth/auth-tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileUploader } from '@/components/dashboard/file-uploader';
import { MaterialsHistory } from '@/components/dashboard/materials-history';
import type { AnalysisResult, HistoryItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AnalysisDisplay } from '@/components/dashboard/analysis/analysis-display';

export default function HomePage() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const { toast } = useToast();
    
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [historyKey, setHistoryKey] = useState(Date.now()); // Used to force-refresh history component

    const handleAnalysisComplete = (result: AnalysisResult | null) => {
        if (result) {
            setAnalysisResult(result);
            
            try {
                const newHistoryItem: HistoryItem = {
                    id: `analysis_${new Date().toISOString()}`,
                    courseName: result.courseName,
                    subjectArea: result.subjectArea,
                    date: new Date().toLocaleDateString('es-CL'),
                    status: 'Completado',
                    analysis: result,
                };
                
                // Always add the new item. Deduplication will happen in the history component.
                const existingHistory: HistoryItem[] = JSON.parse(localStorage.getItem('sand_classmate_history') || '[]');
                const updatedHistory = [newHistoryItem, ...existingHistory];

                localStorage.setItem('sand_classmate_history', JSON.stringify(updatedHistory));
                setHistoryKey(Date.now()); // Trigger refresh
                
            } catch (error) {
                console.error("Failed to save to localStorage", error);
                toast({
                    variant: "destructive",
                    title: "Error al Guardar",
                    description: "No se pudo guardar el análisis en el historial."
                });
            }
        }
    };

    const handleRestoreAnalysis = (item: HistoryItem) => {
        if(item.analysis) {
            setAnalysisResult(item.analysis);
            window.scrollTo(0, 0); // Scroll to top to see the restored analysis
        } else {
             toast({
                variant: "destructive",
                title: "Error al Cargar",
                description: "Los datos de este análisis no están completos y no se pueden restaurar."
            });
        }
    };

    const handleReset = () => {
        setAnalysisResult(null);
    }

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
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
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.refresh(); 
    };
    
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
                            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary ${isActive ? 'bg-accent text-primary' : ''}`}
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
    
    const mainContent = analysisResult ? (
        <div className="p-4 md:p-6 lg:p-8">
            <AnalysisDisplay 
                analysisResult={analysisResult}
                onReset={handleReset}
            />
        </div>
    ) : (
        <div className="space-y-8 p-4 md:p-6 lg:p-8">
            <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">¿Qué vamos a crear hoy?</h1>
                <p className="text-muted-foreground mt-2 text-base md:text-lg">
                    Sube tu programa de estudios o apuntes (PDF) y deja que la IA genere presentaciones, guías y más para tus clases.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 flex flex-col h-full">
                    <Card className="h-full">
                        <CardContent className="p-6 h-full">
                            <FileUploader onAnalysisComplete={handleAnalysisComplete} />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-5 flex flex-col h-full">
                     <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Cursos Recientes</CardTitle>
                            <CardDescription>Continúa trabajando en tus últimos análisis.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MaterialsHistory 
                                key={historyKey} 
                                isFullPage={false} 
                                onViewAnalysis={handleRestoreAnalysis} 
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );

    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[260px_1fr]">
            <div className="hidden border-r bg-card text-card-foreground lg:block">
                {sidebarContent}
            </div>
            <div className="flex flex-col">
                 <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 lg:h-[60px] lg:justify-end">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0 bg-card border-r-0 w-[260px]">
                            {sidebarContent}
                        </SheetContent>
                    </Sheet>
                     <div className="w-full flex-1">
                        {/* Header content can go here, e.g. search bar */}
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                       {loading ? (
                           <Loader2 className="h-6 w-6 animate-spin text-primary" />
                       ) : user ? (
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.user_metadata?.avatar_url ?? 'https://placehold.co/40x40.png'} alt="@prof" data-ai-hint="person face" />
                                            <AvatarFallback>{user.email?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
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
                       ) : (
                           <Dialog>
                                <DialogTrigger asChild>
                                    <Button>Ingresar</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md p-0">
                                     <Card className="shadow-none border-none">
                                        <CardHeader className="text-center">
                                            <DialogTitle className="text-2xl">Bienvenido a Sand Classmate</DialogTitle>
                                            <DialogDescription>
                                                Inicia sesión o crea una cuenta para guardar tu trabajo.
                                            </DialogDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <AuthTabs />
                                        </CardContent>
                                    </Card>
                                </DialogContent>
                            </Dialog>
                       )}
                    </div>

                </header>
                 <main className="flex-1 overflow-y-auto bg-background relative">
                    {mainContent}
                </main>
            </div>
        </div>
    );
}
