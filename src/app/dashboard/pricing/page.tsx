
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const CheckListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-center gap-3">
        <Check className="h-5 w-5 text-primary" />
        <span className="text-muted-foreground">{children}</span>
    </li>
);

export default function PricingPage() {
    return (
        <div className="flex flex-col items-center">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Encuentra el Plan Perfecto</h1>
                <p className="text-muted-foreground mt-4 text-lg">
                    Desde proyectos individuales hasta grandes instituciones educativas, tenemos un plan que se adapta a tus necesidades.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                {/* Free Plan */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-2xl">Gratis</CardTitle>
                        <CardDescription>Para empezar a explorar el poder de la IA en la educación.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <p className="text-4xl font-bold">$0 <span className="text-xl font-normal text-muted-foreground">/mes</span></p>
                        <ul className="space-y-3">
                            <CheckListItem>Análisis de 1 curso</CheckListItem>
                            <CheckListItem>Generación de todos los materiales</CheckListItem>
                            <CheckListItem>Soporte por comunidad</CheckListItem>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">Tu Plan Actual</Button>
                    </CardFooter>
                </Card>

                {/* Premium Plan */}
                <Card className="flex flex-col border-2 border-primary shadow-lg relative">
                     <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                        <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                            Más Popular
                        </div>
                    </div>
                    <CardHeader>
                        <CardTitle className="text-2xl">Premium</CardTitle>
                        <CardDescription>Para educadores que quieren llevar sus clases al siguiente nivel.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <p className="text-4xl font-bold">$12.000 <span className="text-xl font-normal text-muted-foreground">CLP/mes</span></p>
                         <ul className="space-y-3">
                            <CheckListItem>Análisis de cursos ilimitados</CheckListItem>
                            <CheckListItem>Guardado y edición de análisis</CheckListItem>
                            <CheckListItem>Generación de materiales mejorada</CheckListItem>
                            <CheckListItem>Soporte prioritario por correo</CheckListItem>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">Actualizar a Premium</Button>
                    </CardFooter>
                </Card>

                {/* Enterprise Plan */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-2xl">Empresas</CardTitle>
                        <CardDescription>Para instituciones y equipos que buscan una solución integral.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                       <p className="text-4xl font-bold">Personalizado</p>
                         <ul className="space-y-3">
                            <CheckListItem>Precio especial por volumen de perfiles</CheckListItem>
                            <CheckListItem>Todas las funciones Premium</CheckListItem>
                            <CheckListItem>Manager de cuenta dedicado</CheckListItem>
                            <CheckListItem>Integraciones personalizadas (LMS)</CheckListItem>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="secondary" className="w-full">Contactar a Ventas</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
