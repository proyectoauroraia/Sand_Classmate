
'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, CheckCircle2, Clipboard, Download, BrainCircuit } from 'lucide-react';

export default function SettingsPage() {
    const [copied, setCopied] = React.useState(false);

    const codeBlock = `GROQ_API_KEY="TU_CLAVE_API_DE_GROQ"`;

    const handleCopy = () => {
        navigator.clipboard.writeText(codeBlock);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    return (
        <div className="flex flex-col items-center justify-start h-full p-4 md:p-6 lg:p-8">
             <div className="w-full max-w-4xl space-y-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configuración</h1>
                    <p className="text-muted-foreground mt-2">
                        Gestiona la seguridad de tu cuenta y las conexiones con servicios externos.
                    </p>
                </div>
                
                {/* Change Password Card */}
                 <Card className="bg-card/80 backdrop-blur-sm border-border/20 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Lock className="h-6 w-6 text-primary" />
                            <CardTitle className="text-lg md:text-xl">Cambiar Contraseña</CardTitle>
                        </div>
                         <CardDescription>
                            Para mayor seguridad, te recomendamos usar una contraseña única que no utilices en otros sitios.
                        </CardDescription>
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
                    <CardFooter>
                         <Button>Actualizar Contraseña</Button>
                    </CardFooter>
                </Card>

                {/* Groq API Key Card */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/20 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                             <BrainCircuit className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle className="text-xl md:text-2xl">Conectar con Llama 3 (vía Groq)</CardTitle>
                                <CardDescription className="mt-1">
                                    Para usar las funciones de IA, necesitas una clave de API de Groq.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                1. Obtén tu Clave de API de Groq
                            </h3>
                            <p className="text-muted-foreground">
                                Puedes obtener tu clave de API gratuita desde la consola de Groq. Es un proceso rápido que te dará acceso a Llama 3 y otros modelos de lenguaje.
                            </p>
                            <div className="pt-2">
                                <Button asChild>
                                    <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">
                                        Obtener Clave de Groq
                                        <Download className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <h3 className="font-semibold text-lg">
                                2. Configura tu Variable de Entorno
                            </h3>
                            <p className="text-muted-foreground">
                                Una vez que tengas tu clave, debes guardarla en un archivo <code className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm">.env.local</code> en la raíz de tu proyecto.
                            </p>
                            <div className="relative mt-4">
                                <div className="bg-gray-800 text-gray-200 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                    <pre><code>{codeBlock}</code></pre>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-white"
                                    onClick={handleCopy}
                                >
                                    {copied ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <Clipboard className="h-5 w-5" />
                                    )}
                                    <span className="sr-only">Copiar código</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
