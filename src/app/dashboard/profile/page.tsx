
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud } from 'lucide-react';

export default function ProfilePage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mi Perfil y Configuración</h1>
                <p className="text-muted-foreground mt-1">
                    Gestiona tu información y personaliza cómo la IA interactúa contigo.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: General Info */}
                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Información Personal</CardTitle>
                            <CardDescription>Tus datos básicos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="name">Nombre Completo</Label>
                                <Input id="name" defaultValue="Professor Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input id="email" type="email" defaultValue="professor@university.edu" disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Rol o Empleo</Label>
                                <Input id="role" defaultValue="Académico, Universidad de Chile" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="city">Ciudad</Label>
                                <Input id="city" defaultValue="Santiago, Chile" />
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Cambiar Contraseña</CardTitle>
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
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: AI Personalization */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personalización con IA</CardTitle>
                            <CardDescription>Sube tu CV y describe tu estilo de enseñanza para que la IA genere contenido adaptado a ti.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="space-y-2">
                                <Label htmlFor="cv-upload">Currículum Vitae (CV)</Label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="cv-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-secondary/30 hover:bg-accent/30">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haz clic para subir</span> o arrastra y suelta</p>
                                            <p className="text-xs text-muted-foreground">PDF, DOCX (MAX. 5MB)</p>
                                        </div>
                                        <Input id="cv-file" type="file" className="hidden" />
                                    </label>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="bio">Mi Filosofía Pedagógica y Carrera</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Describe tu enfoque pedagógico (ej: constructivista, basado en proyectos), tus áreas de especialización y los hitos más importantes de tu carrera..."
                                    rows={12}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
             <div className="flex justify-end">
                <Button size="lg">Guardar Cambios</Button>
            </div>
        </div>
    );
}
