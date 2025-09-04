
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { updateUserProfileAction } from '@/lib/actions';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '@/lib/types';

export default function ProfilePage() {
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    // Component State
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [user, setUser] = React.useState<User | null>(null);
    
    // Form State
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [profileImage, setProfileImage] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    const namesAreEditable = !(firstName && lastName);

    React.useEffect(() => {
        const fetchUserAndProfile = async () => {
            setLoading(true);
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUser(user);
                setEmail(user.email ?? '');

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single<UserProfile>();
                
                if (profile) {
                    setFirstName(profile.first_name ?? '');
                    setLastName(profile.last_name ?? '');
                    setPreviewUrl(profile.avatar_url ?? user.user_metadata?.avatar_url ?? null);
                } else if (error && error.code !== 'PGRST116') {
                    console.error("Error fetching profile:", error.message);
                    toast({ variant: 'destructive', title: 'Error al cargar el perfil', description: error.message });
                } else {
                    // This case handles a new user who might have metadata but no profile entry yet
                    setFirstName(user.user_metadata?.first_name ?? '');
                    setLastName(user.user_metadata?.last_name ?? '');
                    setPreviewUrl(user.user_metadata?.avatar_url ?? null);
                }
            }
            setLoading(false);
        };

        fetchUserAndProfile();
    }, [toast]);

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
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        
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
            if (data?.avatar_url) {
                setPreviewUrl(data.avatar_url);
            }
        }
    };
    
    const getInitials = () => {
        const first = firstName ? firstName.charAt(0) : '';
        const last = lastName ? lastName.charAt(0) : '';
        return `${first}${last}`.toUpperCase() || email.charAt(0).toUpperCase();
    }

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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="md:col-span-1">
                            <Card className="bg-card/80 backdrop-blur-sm border-border/20 shadow-lg text-center p-6">
                                 <div className="relative group w-24 h-24 md:w-32 md:h-32 mx-auto">
                                    <Avatar className="h-full w-full cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <AvatarImage src={previewUrl ?? undefined} alt="Foto de Perfil" data-ai-hint="person face" className="object-cover" />
                                        <AvatarFallback className="bg-secondary/50 text-muted-foreground text-3xl">
                                            {getInitials()}
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
                                    <h3 className="text-lg md:text-xl font-semibold">{[firstName, lastName].filter(Boolean).join(' ') || 'Nombre Apellido'}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{email}</p>
                                </div>
                            </Card>
                        </div>
                        <div className="md:col-span-2">
                             <Card className="bg-card/80 backdrop-blur-sm border-border/20 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Información Personal</CardTitle>
                                    <CardDescription>Esta información es privada y no se compartirá sin tu permiso.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                         <div className="space-y-2">
                                            <Label htmlFor="firstName">Nombre</Label>
                                            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!namesAreEditable} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="lastName">Apellido</Label>
                                            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!namesAreEditable} />
                                        </div>
                                     </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email de Contacto</Label>
                                        <Input id="email" type="email" value={email} disabled />
                                         <p className="text-xs text-muted-foreground">Tu email de inicio de sesión no se puede cambiar.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                   
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
