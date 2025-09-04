
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserCircle2, BrainCircuit, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { updateUserProfileAction } from '@/lib/actions';
import type { User } from '@supabase/supabase-js';


export default function ProfilePage() {
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    // Component State
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [user, setUser] = React.useState<User | null>(null);
    
    // Form State
    const [fullName, setFullName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [role, setRole] = React.useState('');
    const [city, setCity] = React.useState('');
    const [profileImage, setProfileImage] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchUserAndProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUser(user);
                setEmail(user.email ?? '');
                setPreviewUrl(user.user_metadata?.avatar_url ?? null);

                // Fetch profile data from 'profiles' table
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setFullName(profile.fullName ?? user.user_metadata?.full_name ?? '');
                    setRole(profile.role ?? '');
                    setCity(profile.city ?? '');
                    if (profile.avatar_url) {
                        setPreviewUrl(profile.avatar_url);
                    }
                } else if (error && error.code !== 'PGRST116') { // Ignore 'no rows found' error
                    console.error("Error fetching profile:", error.message);
                } else {
                     setFullName(user.user_metadata?.full_name ?? '');
                }
            }
            setLoading(false);
        };

        fetchUserAndProfile();
    }, []);


    const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setProfileImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('role', role);
        formData.append('city', city);
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        const { data, error } = await updateUserProfileAction(formData);

        setSaving(false);

        if (error) {
            toast({
                variant: 'destructive',
                title: "Error al Guardar",
                description: error,
                duration: 9000,
            });
        } else {
            toast({
                title: "¡Perfil Actualizado!",
                description: "Tus cambios han sido guardados exitosamente.",
            });
            // Update the preview URL with the new one from the server if it exists
            if (data?.avatar_url) {
                setPreviewUrl(data.avatar_url);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <p>Debes iniciar sesión para ver tu perfil.</p>
            </div>
        );
    }
    
    return (
        <form onSubmit={handleSaveChanges}>
            <div className="space-y-8 p-4 md:p-6 lg:p-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mi Perfil y Configuración</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        Gestiona tu información para mejorar la personalización de la IA.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                    {/* Left Column: General Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-card/80 backdrop-blur-sm border-border/20 shadow-lg">
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
                                    name="profileImage"
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
                                    <Label htmlFor="fullName">Nombre Completo</Label>
                                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
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

                    {/* Right Column: Password */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-card/80 backdrop-blur-sm border-border/20 shadow-lg">
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
                    <Button type="submit" size="lg" disabled={saving || loading} className="w-full md:w-auto py-6 text-base">
                        {saving && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
