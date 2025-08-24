
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Presentation, FileText, ClipboardCheck, Loader2, Download, RefreshCw, AlertCircle, Copy, BookOpen, Lightbulb, GraduationCap, Sparkles, Youtube, Link as LinkIcon, Target, BookCopy, Calendar, ListChecks, PencilRuler } from 'lucide-react';
import { analyzeContentAction, generateMaterialsActionFromAnalysis } from '@/lib/actions';
import type { AnalysisResult, GeneratedMaterials } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '../ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type GenerationState = 'idle' | 'analyzing' | 'generating' | 'success';

type FileUploaderProps = {
    onAnalysisComplete: (result: AnalysisResult | null) => void;
};


export function FileUploader({ onAnalysisComplete }: FileUploaderProps) {
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
            const dataUri = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });

            const response = await analyzeContentAction(dataUri);

            if (response.error || !response.data) {
                throw new Error(response.error || 'Falló el análisis del contenido.');
            }

            setAnalysisResult(response.data);
            onAnalysisComplete(response.data);
            toast({
                title: "¡Análisis Completo!",
                description: `Hemos analizado tu documento sobre "${response.data.subjectArea}".`,
            });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
            setError(errorMessage);
            toast({
                variant: "destructive",
                title: "Falló el Análisis",
                description: errorMessage,
            });
        } finally {
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
        onAnalysisComplete(null);
    }

    if (generationState === 'analyzing' || generationState === 'generating') {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-10 h-96">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                <p className="text-xl font-semibold">
                    {generationState === 'analyzing' ? 'Analizando tu documento...' : 'Generando tus materiales...'}
                </p>
                <p className="text-muted-foreground mt-2">Esto puede tardar unos momentos. No cierres esta página.</p>
            </Card>
        );
    }
    
    if(analysisResult) {
        return (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                               <BookOpen className="h-7 w-7 text-primary"/>
                               <span className="text-2xl">Análisis del Curso: "{analysisResult.subjectArea}"</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {analysisResult.weeks && (
                                    <div className="bg-secondary/30 p-4 rounded-lg">
                                        <div className="flex items-center gap-3 text-lg font-semibold"><Calendar className="h-6 w-6" /> Duración Estimada</div>
                                        <p className="text-primary text-3xl font-bold mt-2">{analysisResult.weeks} {typeof analysisResult.weeks === 'number' && analysisResult.weeks > 1 ? 'Semanas' : 'Semana'}</p>
                                    </div>
                                )}
                                 {analysisResult.keyConcepts && (
                                    <div className="bg-secondary/30 p-4 rounded-lg">
                                        <div className="flex items-center gap-3 text-lg font-semibold"><BookCopy className="h-6 w-6" /> Conceptos Clave</div>
                                        <div className="flex flex-wrap gap-2 justify-start mt-2">
                                            {analysisResult.keyConcepts.map((concept, i) => (
                                                <span key={i} className="bg-primary text-primary-foreground font-medium px-3 py-1 rounded-full text-xs">{concept}</span>
                                            ))}
                                        </div>
                                    </div>
                                 )}
                            </div>

                            {analysisResult.courseStructure && (
                            <div>
                                <h3 className="font-semibold text-xl mb-3 flex items-center gap-2"><ListChecks className="h-6 w-6 text-primary"/> Estructura del Curso y Objetivos</h3>
                                 <Accordion type="single" collapsible className="w-full">
                                    {analysisResult.courseStructure.map((unit, i) => (
                                        <AccordionItem value={`item-${i}`} key={i}>
                                            <AccordionTrigger className="text-base font-medium hover:no-underline">{unit.title}</AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-4">
                                                    {unit.learningObjectives.map((obj, j) => <li key={j}>{obj}</li>)}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                            )}
                            
                             {analysisResult.assessments && (
                             <div>
                                <h3 className="font-semibold text-xl mb-3 flex items-center gap-2"><PencilRuler className="h-6 w-6 text-primary"/> Evaluaciones</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {analysisResult.assessments.map((assessment, i) => (
                                        <div key={i} className="p-4 rounded-lg bg-secondary/30">
                                            <div className="font-semibold">{assessment.type}</div>
                                            <p className="text-sm text-muted-foreground mt-1">{assessment.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            )}

                            {analysisResult.bibliography && (
                            <div>
                                <h3 className="font-semibold text-xl mb-3">Bibliografía</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {analysisResult.bibliography.mentioned && analysisResult.bibliography.mentioned.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-2">Mencionada en el Documento</h4>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground bg-secondary/30 p-4 rounded-lg space-y-2">
                                            {analysisResult.bibliography.mentioned.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                    </div>
                                    )}
                                     {analysisResult.bibliography.recommended && analysisResult.bibliography.recommended.length > 0 && (
                                     <div>
                                        <h4 className="font-semibold mb-2">Recomendada</h4>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground bg-secondary/30 p-4 rounded-lg space-y-2">
                                            {analysisResult.bibliography.recommended.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                    </div>
                                     )}
                                </div>
                            </div>
                            )}
                            
                             {analysisResult.enrichedContent && analysisResult.enrichedContent.externalLinks.length > 0 && (
                             <div>
                                <h3 className="font-semibold text-xl mb-3">Recursos Externos Sugeridos</h3>
                                 <div className="space-y-3">
                                    {analysisResult.enrichedContent.externalLinks.map((link, i) => (
                                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg bg-secondary/30 hover:bg-accent/40 transition-colors">
                                            <div className="font-semibold flex items-center gap-2 text-primary"><LinkIcon className="h-4 w-4"/> {link.title}</div>
                                            <p className="text-xs text-muted-foreground mt-1">{link.summary}</p>
                                        </a>
                                    ))}
                                </div>
                            </div>
                             )}

                             {analysisResult.enrichedContent && analysisResult.enrichedContent.youtubeVideos.length > 0 && (
                             <div>
                                <h3 className="font-semibold text-xl mb-3">Videos de YouTube Recomendados</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {analysisResult.enrichedContent.youtubeVideos.map((video, i) => (
                                        <a key={i} href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg bg-secondary/30 hover:bg-accent/40 transition-colors">
                                            <div className="font-semibold flex items-center gap-2 text-red-600"><Youtube className="h-5 w-5"/> {video.title}</div>
                                            <p className="text-xs text-muted-foreground mt-1">{video.summary}</p>
                                        </a>
                                    ))}
                                </div>
                            </div>
                             )}
                        </CardContent>
                    </Card>
                </div>

                 <div className="lg:col-span-1 space-y-6">
                    <Card className="sticky top-6">
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
        <Card className="bg-card/80 backdrop-blur-sm">
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
                        className="flex flex-col items-center justify-center p-10 rounded-lg cursor-pointer transition-colors bg-secondary/30 hover:bg-accent/30 border-2 border-dashed border-border"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadCloud className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-lg font-semibold text-foreground">
                            {fileName ? fileName : 'Haz clic o arrastra un archivo para subir'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Se admiten documentos PDF (máx. 10MB)</p>
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
        <Button onClick={onClick} disabled={disabled} variant="outline" className="w-full justify-center h-24 p-4 gap-2 text-center flex-col">
            <Icon className="h-8 w-8 text-primary" />
            <span className="text-sm font-medium">{title}</span>
        </Button>
    );
}

    
