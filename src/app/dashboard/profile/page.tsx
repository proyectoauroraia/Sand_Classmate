
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCircle2, Loader2 } from 'lucide-react';
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
        <div className="flex flex-col items-center justify-start h-full p-4 md:p-6 lg:p-8">
            <div className="w-full max-w-4xl">
                 <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mi Perfil</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        Gestiona tu información para mejorar la personalización de la IA.
                    </p>
                </div>
                <form onSubmit={handleSaveChanges}>
                    <Card className="bg-card/80 backdrop-blur-sm border-border/20 shadow-lg">
                        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
                            {/* Avatar Section */}
                            <div className="md:col-span-1 flex flex-col items-center text-center">
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
                                    <h3 className="text-lg md:text-xl font-semibold">{fullName || 'Nombre de Usuario'}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{role || 'Rol o Empleo'}</p>
                                </div>
                            </div>
                            
                            {/* Form Fields Section */}
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="fullName">Nombre Completo</Label>
                                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <Input id="email" type="email" value={email} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Rol o Empleo</Label>
                                    <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ej: Académico, U. de Chile" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">Ciudad</Label>
                                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ej: Santiago, Chile" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end pt-6">
                        <Button type="submit" size="lg" disabled={saving || loading} className="w-full md:w-auto py-6 text-base">
                            {saving && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
