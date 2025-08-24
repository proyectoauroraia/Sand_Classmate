import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Configuración de Perfil</CardTitle>
                    <CardDescription>Actualiza tu información personal y tus preferencias.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input id="name" defaultValue="Professor Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Dirección de Correo</Label>
                            <Input id="email" type="email" defaultValue="professor@university.edu" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Rol o Empleo</Label>
                            <Input id="role" defaultValue="Académico, Universidad de Chile" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">Ciudad</Label>
                            <Input id="city" defaultValue="Santiago, Chile" />
                        </div>
                    </div>
                    <Button>Guardar Cambios</Button>
                </CardContent>
            </Card>

            <Separator />
            
            <Card>
                 <CardHeader>
                    <CardTitle className="font-headline">Mi Filosofía Pedagógica</CardTitle>
                    <CardDescription>Describe tu enfoque para la enseñanza y la evaluación para recibir un feedback constructivo de la IA.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="pedagogy-description">¿Cómo describes tu enfoque pedagógico?</Label>
                        <Textarea
                            id="pedagogy-description"
                            placeholder="Ej: 'Creo en un aprendizaje centrado en el estudiante, utilizando metodologías activas como el aprendizaje basado en proyectos. Mi evaluación busca ser auténtica y formativa...'"
                            rows={5}
                        />
                    </div>
                    <Button>Analizar y Obtener Feedback</Button>
                </CardContent>
            </Card>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Cambiar Contraseña</CardTitle>
                    <CardDescription>Por seguridad, elige una contraseña fuerte y única.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="current-password">Contraseña Actual</Label>
                        <Input id="current-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-password">Nueva Contraseña</Label>
                        <Input id="new-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                    <Button>Actualizar Contraseña</Button>
                </CardContent>
            </Card>

        </div>
    );
}
