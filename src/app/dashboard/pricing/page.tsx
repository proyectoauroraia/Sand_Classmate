
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { DunesBackground } from '@/components/icons/dunes-background';

const CheckListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-3">
        <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
        <span className="text-muted-foreground">{children}</span>
    </li>
);

export default function PricingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-full p-4 md:p-6 lg:p-8 relative overflow-hidden">
            <DunesBackground />
            <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12 z-10">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl z-10">
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
                        <Button variant="secondary" className="w-full text-base py-6 bg-[#2F5D62] hover:bg-[#2F5D62]/90 text-white">Tu Plan Actual</Button>
                    </CardFooter>
                </Card>

                {/* Premium Plan */}
                <Card className="flex flex-col rounded-xl border-2 border-yellow-400 bg-yellow-50/20 backdrop-blur-sm shadow-2xl shadow-yellow-400/20">
                     <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                        <div className="bg-[#8BAA36] text-white px-4 py-1 rounded-full text-sm font-semibold">
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
                        <Button className="w-full text-base py-6 bg-[#8BAA36] hover:bg-[#8BAA36]/90 text-white">Actualizar a Premium</Button>
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
