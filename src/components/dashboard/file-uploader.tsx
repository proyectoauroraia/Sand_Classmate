
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Presentation, FileText, ClipboardCheck, Loader2, Download, RefreshCw, AlertCircle, Copy, BookOpen, Lightbulb, GraduationCap, Sparkles } from 'lucide-react';
import { analyzeContentAction, generateMaterialsActionFromAnalysis } from '@/lib/actions';
import type { AnalysisResult, GeneratedMaterials } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '../ui/label';

type GenerationState = 'idle' | 'analyzing' | 'generating' | 'success';

export function FileUploader() {
    const [generationState, setGenerationState] = useState<GenerationState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [generatedMaterials, setGeneratedMaterials] = useState<GeneratedMaterials | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (file: File | null) => {
        if (file) {
            setFileName(file.name);
            setError(null);
        }
    };

    const handleAnalysisSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const file = fileInputRef.current?.files?.[0];

        if (!file) {
            setError('Por favor, selecciona un archivo para analizar.');
            return;
        }

        setGenerationState('analyzing');
        setError(null);
        setAnalysisResult(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const dataUri = reader.result as string;
                const response = await analyzeContentAction(dataUri);

                if (response.error || !response.data) {
                    throw new Error(response.error || 'Falló el análisis del contenido.');
                }

                setAnalysisResult(response.data);
                setGenerationState('idle');
                toast({
                  title: "¡Análisis Completo!",
                  description: `Hemos analizado tu documento sobre ${response.data.subjectArea}.`,
                });
            };
            reader.onerror = () => {
                throw new Error('No se pudo leer el archivo.');
            };
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
            setError(errorMessage);
            toast({
              variant: "destructive",
              title: "Falló el Análisis",
              description: errorMessage,
            });
            setGenerationState('idle');
        }
    };

    const handleGenerationSubmit = async (materialType: keyof GeneratedMaterials) => {
        if (!analysisResult) return;

        setGenerationState('generating');
        setError(null);

        try {
            const response = await generateMaterialsActionFromAnalysis(analysisResult, materialType);
            if(response.error || !response.data) {
                throw new Error(response.error || `No se pudo generar el material: ${materialType}`);
            }

            const link = document.createElement('a');
            link.href = response.data;
            
            const fileNames = {
                powerpointPresentation: 'presentacion.pptx',
                workGuide: 'guia_de_trabajo.pdf',
                exampleTests: 'examen_de_ejemplo.pdf',
                interactiveReviewPdf: 'repaso_interactivo.pdf'
            };

            link.download = fileNames[materialType] || 'material.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

             toast({
                title: '¡Material Generado!',
                description: `Tu ${fileNames[materialType]} se ha descargado.`,
            });

        } catch (e) {
             const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
            setError(errorMessage);
            toast({
              variant: "destructive",
              title: "Falló la Generación",
              description: errorMessage,
            });
        } finally {
            setGenerationState('idle');
        }
    }

    const handleGenerateAll = async () => {
        // This is a simplified version. A real implementation might zip files on the server.
        await handleGenerationSubmit('powerpointPresentation');
        await handleGenerationSubmit('workGuide');
        await handleGenerationSubmit('exampleTests');
        await handleGenerationSubmit('interactiveReviewPdf');
    };


    const resetState = () => {
        setGenerationState('idle');
        setError(null);
        setAnalysisResult(null);
        setGeneratedMaterials(null);
        setFileName(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    if (generationState === 'analyzing' || generationState === 'generating') {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-10 h-96">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                <p className="text-xl font-semibold">
                    {generationState === 'analyzing' ? 'Analizando tu documento...' : 'Generando tu material...'}
                </p>
                <p className="text-muted-foreground mt-2">Esto puede tardar unos momentos. No cierres esta página.</p>
            </Card>
        );
    }
    
    if(analysisResult) {
        return (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                           <BookOpen className="h-7 w-7 text-primary"/>
                           <span className="text-2xl">Análisis de "{analysisResult.subjectArea}"</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Resumen del Contenido</h3>
                            <p className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-lg">{analysisResult.summary}</p>
                        </div>
                         <div>
                            <h3 className="font-semibold text-lg mb-2">Conceptos Clave Identificados</h3>
                             <div className="flex flex-wrap gap-2">
                                {analysisResult.keyConcepts.map((concept, i) => (
                                    <span key={i} className="bg-primary/10 text-primary-foreground font-medium px-3 py-1 rounded-full text-xs bg-primary">{concept}</span>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h3 className="font-semibold text-lg mb-2">Enriquecimiento Científico</h3>
                            <p className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-lg">{analysisResult.scientificContext}</p>
                        </div>
                    </CardContent>
                </Card>
                 <div className="col-span-1 space-y-6">
                    <Card>
                         <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                               <GraduationCap className="h-7 w-7 text-primary"/>
                               <span className="text-2xl">Generar Material</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button size="lg" className="w-full py-7 text-lg" onClick={handleGenerateAll} disabled={generationState === 'generating'}>
                                <Sparkles className="mr-3 h-6 w-6"/>
                                Generar Todo
                            </Button>
                            <div className="grid grid-cols-2 gap-4">
                                <MaterialButton icon={Presentation} title="Presentación" onClick={() => handleGenerationSubmit('powerpointPresentation')} disabled={generationState === 'generating'} />
                                <MaterialButton icon={FileText} title="Guía de Trabajo" onClick={() => handleGenerationSubmit('workGuide')} disabled={generationState === 'generating'}/>
                                <MaterialButton icon={ClipboardCheck} title="Examen" onClick={() => handleGenerationSubmit('exampleTests')} disabled={generationState === 'generating'}/>
                                <MaterialButton icon={Lightbulb} title="Repaso" onClick={() => handleGenerationSubmit('interactiveReviewPdf')} disabled={generationState === 'generating'}/>
                            </div>
                        </CardContent>
                    </Card>
                    <Button onClick={resetState} variant="outline" className="w-full py-6 text-base">
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Analizar Otro Documento
                    </Button>
                 </div>
             </div>
        );
    }

    return (
        <Card>
            <CardContent className="p-6">
                <form onSubmit={handleAnalysisSubmit} className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div 
                        className="flex flex-col items-center justify-center p-10 rounded-lg cursor-pointer transition-colors bg-secondary/50 hover:bg-accent/40 border-2 border-dashed border-border"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadCloud className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-lg font-semibold text-foreground">
                            {fileName ? fileName : 'Haz clic o arrastra un archivo para subir'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Solo se admiten documentos PDF (máx. 10MB)</p>
                        <Input 
                            ref={fileInputRef} 
                            id="syllabusFile" 
                            name="syllabusFile" 
                            type="file" 
                            className="hidden" 
                            accept=".pdf"
                            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        />
                    </div>
                    <Button type="submit" disabled={generationState !== 'idle' || !fileName} size="lg" className="w-full py-7 text-lg">
                        {generationState === 'analyzing' ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <BookOpen className="mr-3 h-6 w-6" />}
                        Analizar Contenido
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function MaterialButton({ icon: Icon, title, onClick, disabled }: { icon: React.ElementType, title: string, onClick: () => void, disabled: boolean }) {
    return (
        <Button onClick={onClick} disabled={disabled} variant="outline" className="w-full justify-center h-auto p-4 gap-2 text-center flex-col aspect-square">
            <Icon className="h-8 w-8 text-primary" />
            <span className="text-sm font-medium">{title}</span>
        </Button>
    );
}

    