
'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clipboard, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function SettingsPage() {
    const [copied, setCopied] = React.useState(false);

    const codeBlock = `GEMINI_API_KEY="TU_CLAVE_API_GEMINI"`;

    const handleCopy = () => {
        navigator.clipboard.writeText(codeBlock);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    return (
        <div className="h-full p-4 md:p-6 lg:p-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configuración</h1>
            <p className="text-muted-foreground mt-2">
                Guías y ajustes para conectar Sand Classmate con servicios externos.
            </p>

            <div className="mt-8 max-w-4xl mx-auto">
                <Card className="bg-card/80 backdrop-blur-sm border-border/20 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                            <div>
                                <CardTitle className="text-xl md:text-2xl">Conectar con Google Gemini</CardTitle>
                                <CardDescription className="mt-1">
                                    Para usar las funciones de IA, necesitas una clave de API de Google Gemini.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                1. Obtén tu Clave de API <Badge variant="secondary">Gratis</Badge>
                            </h3>
                            <p className="text-muted-foreground">
                                Puedes obtener tu clave de API gratuita de Google AI Studio. Es un proceso rápido que te dará acceso a los modelos de Gemini.
                            </p>
                            <div className="pt-2">
                                <Button asChild>
                                    <Link href="https://aistudio.google.com/app/apikey" target="_blank">
                                        Obtener Clave de Gemini
                                        <Download className="ml-2 h-4 w-4" />
                                    </Link>
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
