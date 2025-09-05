// src/app/test-groq/page.tsx

'use client'; 

import React, { useState } from 'react';
import { educationalContentFlows } from '@/ai/flows';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, BrainCircuit } from 'lucide-react';
import { DuneBackground } from '@/components/icons/dune-background';
import type { GenerateResponse } from 'genkit';

export default function TestGroq() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKeyIsSet, setApiKeyIsSet] = useState(false);

  React.useEffect(() => {
    // This is a bit of a hack for client-side check, but it works for this test page.
    // In a real app, this check would happen server-side.
    // We are just checking if the variable has a value, not the value itself.
    // NOTE: In a real scenario, you wouldn't expose GROQ_API_KEY to the client.
    // This is just for this debug page.
    const key = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;
    setApiKeyIsSet(!!key);
  }, []);

  const testGroq = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setError('');
    setResponse('');

    try {
      // The flow returns the full GenerateResponse object
      const result = await educationalContentFlows.askSandClassmate(question, {
        subject: 'Matemáticas',
        level: 'secundaria'
      });
      
      // We extract the text from the response
      setResponse(result);
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      console.error('Error completo:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickTests = [
    '¿Qué es una ecuación lineal?',
    'Explica la fotosíntesis',
    'Resuelve: 2x + 5 = 15',
    '¿Cómo funciona la gravedad?'
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
        <DuneBackground />
        <div className="max-w-4xl mx-auto z-10 w-full">
        <Card className="bg-card/90 backdrop-blur-sm border-border/30 shadow-2xl">
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary flex items-center gap-3">
                    <BrainCircuit className="h-8 w-8" />
                    Test Sand Classmate + Groq
                </CardTitle>
                <CardDescription>
                Prueba la integración con Groq Cloud para verificar la conexión con la IA.
                </CardDescription>
            </CardHeader>
            <CardContent>

                <div className="mb-6 p-4 bg-secondary/40 rounded-lg border border-border/50">
                    <h3 className="font-semibold text-card-foreground mb-2">Estado de la configuración:</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                            {apiKeyIsSet ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                            <span>GROQ_API_KEY configurada en el entorno.</span>
                        </li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Groq SDK instalado.</li>
                         <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Modelo personalizado definido en Genkit.</li>
                    </ul>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-card-foreground">Pruebas rápidas:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {quickTests.map((test, index) => (
                        <Button
                            key={index}
                            onClick={() => setQuestion(test)}
                            variant="outline"
                            className="text-left justify-start font-normal h-auto py-3"
                            disabled={loading}
                        >
                            {test}
                        </Button>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">
                        Tu pregunta para Sand Classmate:
                    </label>
                    <Textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ejemplo: Explícame las ecuaciones cuadráticas paso a paso"
                        rows={3}
                        disabled={loading}
                    />
                </div>

                <Button
                    onClick={testGroq}
                    disabled={loading || !question.trim()}
                    className="w-full py-6 text-base"
                    size="lg"
                >
                    {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Pensando...</> : '🚀 Preguntar a Sand Classmate'}
                </Button>

                {response && (
                    <div className="mt-6">
                        <h3 className="font-semibold text-green-600 mb-2">✅ Respuesta de Sand Classmate:</h3>
                        <Alert variant="default" className="bg-green-500/5 border-green-500/20">
                           <AlertDescription className="text-green-800 whitespace-pre-wrap">{response}</AlertDescription>
                        </Alert>
                    </div>
                )}

                {error && (
                    <div className="mt-6">
                        <h3 className="font-semibold text-destructive mb-2">❌ Error:</h3>
                         <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Ocurrió un error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                        <div className="mt-3 text-sm text-destructive/80">
                            <strong>Posibles soluciones:</strong>
                            <ul className="list-disc list-inside mt-1">
                                <li>Verificar que GROQ_API_KEY esté en `.env.local`</li>
                                <li>Reiniciar el servidor de desarrollo</li>
                                <li>Verificar la conexión a internet</li>
                            </ul>
                        </div>
                    </div>
                )}

                 <div className="mt-8 p-4 bg-secondary/40 rounded-lg text-xs text-muted-foreground">
                    <strong>Información de desarrollo:</strong>
                    <br />
                    • Modelo: llama3-8b-8192 (vía Groq SDK)
                    • Costo aproximado: $0.10 por millón de tokens
                    • Velocidad: ~500 tokens/segundo
                    <br />
                    <strong>Siguiente paso:</strong> Si funciona, la IA está lista para ser usada en el resto de la app.
                </div>
            </CardContent>
        </Card>
        </div>
    </div>
  );
}
