
'use client';

import *d React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, UserCircle2, BrainCircuit, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const cvInputRef = React.useRef<HTMLInputElement>(null);

    // State for user profile data
    const [loading, setLoading] = React.useState(true);
    const [fullName, setFullName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [role, setRole] = React.useState('');
    const [city, setCity] = React.useState('');
    const [bio, setBio] = React.useState('');
    const [cvFile, setCvFile] = React.useState<File | null>(null);
    const [profileImage, setProfileImage] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setEmail(user.email ?? '');
                setFullName(user.user_metadata?.full_name ?? '');
                setPreviewUrl(user.user_metadata?.avatar_url ?? null);
                // In a real app, you'd fetch role, city, bio from your 'profiles' table
            }
            setLoading(false);
        };

        fetchUser();
    }, []);


    const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setProfileImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    
    const handleSaveChanges = () => {
        // In a real app, you would handle the form submission to your backend here.
        // This includes updating the user profile data and uploading the CV and profile image files.
        console.log({
            fullName,
            role,
            city,
            bio,
            cvFile,
            profileImage,
        });

        toast({
            title: "¡Perfil Actualizado!",
            description: "Tus cambios han sido guardados exitosamente.",
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
    

    return (
        <div className="space-y-8 p-4 md:p-6 lg:p-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mi Perfil y Configuración</h1>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">
                    Gestiona tu información y personaliza cómo la IA interactúa contigo.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                {/* Left Column: General Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="items-center text-center p-6">
                             <div className="relative group w-24 h-24 md:w-32 md:h-32">
                                <Avatar className="h-full w-full cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <AvatarImage src={previewUrl ?? undefined} alt="Foto de Perfil" data-ai-hint="person face" className="object-cover" />
                                    <AvatarFallback className="bg-secondary/50 text-muted-foreground">
                                        <UserCircle2 className="h-16 w-16 md:h-20 md:w-20" />
                                    </AvatarFallback>
                                </Avatar>
                                <div 
                                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <span className="text-white text-xs font-semibold text-center">Cambiar Foto</span>
                                </div>
                            </div>
                             <Input 
                                ref={fileInputRef} 
                                type="file" 
                                className="hidden" 
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleProfileImageChange}
                            />
                            <div className="pt-4">
                                <CardTitle className="text-xl md:text-2xl">{fullName || 'Nombre de Usuario'}</CardTitle>
                                <CardDescription className="mt-1 text-sm">{role || 'Rol o Empleo'}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 px-4 md:px-6">
                             <div className="space-y-2">
                                <Label htmlFor="name">Nombre Completo</Label>
                                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input id="email" type="email" value={email} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Rol o Empleo</Label>
                                <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ej: Académico, Universidad de..." />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="city">Ciudad</Label>
                                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ej: Santiago, Chile" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: AI Personalization & Password */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <BrainCircuit className="h-6 w-6 text-primary" />
                                <CardTitle className="text-lg md:text-xl">Personalización con IA</CardTitle>
                            </div>
                            <CardDescription>Sube tu CV y describe tu estilo de enseñanza para que la IA genere contenido adaptado a ti.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="space-y-2">
                                <Label htmlFor="cv-upload">Currículum Vitae (CV)</Label>
                                <div 
                                     className="flex items-center justify-center w-full"
                                     onClick={() => cvInputRef.current?.click()}
                                >
                                    <label 
                                        htmlFor="cv-file" 
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-secondary/30 hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground px-2">
                                                {cvFile ? cvFile.name : <><span className="font-semibold">Haz clic para subir</span> o arrastra y suelta</>}
                                            </p>
                                            <p className="text-xs text-muted-foreground">PDF, DOCX (MAX. 5MB)</p>
                                        </div>
                                        <Input ref={cvInputRef} id="cv-file" type="file" className="hidden" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                                    </label>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="bio">Mi Filosofía Pedagógica y Carrera</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Describe tu enfoque pedagógico (ej: constructivista, basado en proyectos), tus áreas de especialización y los hitos más importantes de tu carrera..."
                                    rows={8}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                             <div className="flex items-center gap-3">
                                <Lock className="h-6 w-6 text-primary" />
                                <CardTitle className="text-lg md:text-xl">Cambiar Contraseña</CardTitle>
                            </div>
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
            </div>
             <div className="flex justify-end pt-4">
                <Button size="lg" onClick={handleSaveChanges} className="w-full md:w-auto py-6 text-base">Guardar Cambios</Button>
            </div>
        </div>
    );
}
