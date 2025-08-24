import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Configuración de Perfil</CardTitle>
                    <CardDescription>Actualiza tu información personal y tus preferencias.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input id="name" defaultValue="Professor Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Dirección de Correo</Label>
                        <Input id="email" type="email" defaultValue="professor@university.edu" />
                    </div>
                    <Button>Guardar Cambios</Button>
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
