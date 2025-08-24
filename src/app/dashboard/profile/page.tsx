
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Link as LinkIcon, Trash2 } from 'lucide-react';

export default function ProfilePage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mi Perfil Profesional</h1>
                <p className="text-muted-foreground mt-1">
                    Completa tu perfil para que la IA pueda entender mejor tu experiencia y estilo de enseñanza.
                </p>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Mi Trayectoria Profesional</CardTitle>
                    <CardDescription>Sube tu CV y describe tu carrera para personalizar el contenido generado.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="cv-upload">Currículum Vitae (CV)</Label>
                        <div className="flex items-center gap-4">
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
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="bio">Biografía y Filosofía Pedagógica</Label>
                        <Textarea
                            id="bio"
                            placeholder="Describe tu carrera, tus logros más importantes y tu enfoque de la enseñanza..."
                            rows={8}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Guardar Trayectoria</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mis Publicaciones y Artículos</CardTitle>
                    <CardDescription>Añade enlaces a tus trabajos para que la IA los conozca.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Placeholder for dynamic list of publications */}
                    <div className="flex items-center gap-4">
                        <div className="grid gap-2 flex-grow">
                             <Label htmlFor="pub-title-1">Título</Label>
                            <Input id="pub-title-1" placeholder="Ej: 'El impacto de la IA en la educación superior'" />
                        </div>
                         <div className="grid gap-2 flex-grow">
                             <Label htmlFor="pub-url-1">URL</Label>
                            <Input id="pub-url-1" placeholder="https://mi-blog.com/articulo" />
                        </div>
                        <Button variant="ghost" size="icon" className="self-end">
                            <Trash2 className="h-5 w-5 text-red-500" />
                        </Button>
                    </div>
                     <Separator />
                     <Button variant="outline">Añadir otra publicación</Button>
                </CardContent>
                 <CardFooter>
                    <Button>Guardar Publicaciones</Button>
                </CardFooter>
            </Card>

        </div>
    );
}
