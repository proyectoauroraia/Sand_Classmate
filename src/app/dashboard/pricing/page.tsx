
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { DunesBackground } from '@/components/icons/dunes-background';
import { createCheckoutSessionAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

const CheckListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-3">
        <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
        <span className="text-muted-foreground">{children}</span>
    </li>
);

export default function PricingPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isPremiumLoading, setIsPremiumLoading] = React.useState(false);

    const handlePremiumSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPremiumLoading(true);
        try {
            const { data, error } = await createCheckoutSessionAction();
            if (error || !data?.url) {
                throw new Error(error || 'No se pudo iniciar el proceso de pago.');
            }
            // Redirect to payment gateway
            router.push(data.url);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
            toast({
                variant: 'destructive',
                title: 'Error de Pago',
                description: errorMessage,
            });
            setIsPremiumLoading(false);
        }
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-full relative overflow-hidden">
            <DunesBackground />
            <div className="text-center max-w-2xl mx-auto z-10 p-4 md:p-6 lg:p-8">
                <h1 
                    className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground"
                    style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                >
                    Encuentra el Plan Perfecto
                </h1>
                <p className="text-muted-foreground mt-4 text-base md:text-lg">
                    Desde proyectos individuales hasta grandes instituciones educativas, tenemos un plan que se adapta a tus necesidades.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl z-10 px-4 md:px-6 lg:px-8 pb-8">
                {/* Free Plan */}
                <Card className="flex flex-col rounded-xl bg-card/80 backdrop-blur-sm border-border/20 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl">Gratis</CardTitle>
                        <CardDescription>Para empezar a explorar el poder de la IA en la educación.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <p className="text-4xl md:text-5xl font-bold">$0 <span className="text-lg md:text-xl font-normal text-muted-foreground">/mes</span></p>
                        <ul className="space-y-4">
                            <CheckListItem>Análisis de 1 curso</CheckListItem>
                            <CheckListItem>Generación de todos los materiales</CheckListItem>
                            <CheckListItem>Soporte por comunidad</CheckListItem>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="secondary" className="w-full text-base py-6 bg-[#2F5D62] hover:bg-[#2F5D62]/90 text-white" disabled>Tu Plan Actual</Button>
                    </CardFooter>
                </Card>

                {/* Premium Plan */}
                <Card className="flex flex-col rounded-xl border-2 border-primary bg-accent/30 backdrop-blur-sm shadow-2xl shadow-primary/20 relative pt-8">
                     <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                        <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                            Más Popular
                        </div>
                    </div>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl">Premium</CardTitle>
                        <CardDescription>Para educadores que quieren llevar sus clases al siguiente nivel.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <p className="text-4xl md:text-5xl font-bold">$12.000 <span className="text-lg md:text-xl font-normal text-muted-foreground">CLP/mes</span></p>
                         <ul className="space-y-4">
                            <CheckListItem>Análisis de cursos ilimitados</CheckListItem>
                            <CheckListItem>Guardado y edición de análisis</CheckListItem>
                            <CheckListItem>Generación de materiales mejorada</CheckListItem>
                            <CheckListItem>Soporte prioritario por correo</CheckListItem>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <form onSubmit={handlePremiumSubmit} className="w-full">
                            <Button type="submit" className="w-full text-base py-6" disabled={isPremiumLoading}>
                               {isPremiumLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                Actualizar a Premium
                            </Button>
                        </form>
                    </CardFooter>
                </Card>

                {/* Enterprise Plan */}
                <Card className="flex flex-col rounded-xl bg-card/80 backdrop-blur-sm border-border/20 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl">Empresas</CardTitle>
                        <CardDescription>Para instituciones y equipos que buscan una solución integral.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                       <p className="text-3xl md:text-4xl font-bold pt-4">Personalizado</p>
                         <ul className="space-y-4">
                            <CheckListItem>Precio especial por volumen de perfiles</CheckListItem>
                            <CheckListItem>Todas las funciones Premium</CheckListItem>
                            <CheckListItem>Manager de cuenta dedicado</CheckListItem>
                            <CheckListItem>Integraciones personalizadas (LMS)</CheckListItem>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="secondary" className="w-full text-base py-6 bg-[#2F5D62] hover:bg-[#2F5D62]/90 text-white">Contactar a Ventas</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
