
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Presentation, FileText, ClipboardCheck, Loader2, RefreshCw, AlertCircle, BookOpen, Lightbulb, Youtube, Link as LinkIcon, BookCopy, Calendar, ListChecks, PencilRuler, CheckCircle2, Sparkles, Download } from 'lucide-react';
import { analyzeContentAction, generateMaterialsActionFromAnalysis } from '@/lib/actions';
import type { AnalysisResult, GeneratedMaterials } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


type GenerationState = 'idle' | 'analyzing';
type MaterialKey = keyof GeneratedMaterials;
type MaterialStatus = 'idle' | 'generating' | 'success';

type FileUploaderProps = {
    onAnalysisComplete: (result: AnalysisResult | null) => void;
};


export function FileUploader({ onAnalysisComplete }: FileUploaderProps) {
    const [analysisState, setAnalysisState] = useState<GenerationState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [materialStatuses, setMaterialStatuses] = useState<Record<MaterialKey, MaterialStatus>>({
        powerpointPresentation: 'idle',
        workGuide: 'idle',
        exampleTests: 'idle',
        interactiveReviewPdf: 'idle',
    });
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);

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

        setAnalysisState('analyzing');
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
            setAnalysisState('idle');
        }
    };


    const handleGenerationSubmit = async (materialType: MaterialKey) => {
        if (!analysisResult) return;

        setMaterialStatuses(prev => ({ ...prev, [materialType]: 'generating' }));
        setError(null);

        try {
            const response = await generateMaterialsActionFromAnalysis(analysisResult, materialType);
            if(response.error || !response.data) {
                throw new Error(response.error || `No se pudo generar el material: ${materialType}`);
            }

            const link = document.createElement('a');
            link.href = response.data;
            
            const fileNames: Record<MaterialKey, string> = {
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
            setMaterialStatuses(prev => ({ ...prev, [materialType]: 'success' }));

        } catch (e) {
             const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
            setError(errorMessage);
            toast({
              variant: "destructive",
              title: "Falló la Generación",
              description: errorMessage,
            });
            setMaterialStatuses(prev => ({ ...prev, [materialType]: 'idle' })); // Reset on error
        }
    }

    const handleGenerateAll = async () => {
        setIsGeneratingAll(true);
        const materialsToGenerate: MaterialKey[] = ['powerpointPresentation', 'workGuide', 'exampleTests', 'interactiveReviewPdf'];
        for (const materialType of materialsToGenerate) {
            if (materialStatuses[materialType] === 'idle') {
                await handleGenerationSubmit(materialType);
            }
        }
        setIsGeneratingAll(false);
    };

    const isAnyTaskRunning = isGeneratingAll || Object.values(materialStatuses).some(s => s === 'generating');

    const resetState = () => {
        setAnalysisState('idle');
        setError(null);
        setAnalysisResult(null);
        setFileName(null);
         setMaterialStatuses({
            powerpointPresentation: 'idle',
            workGuide: 'idle',
            exampleTests: 'idle',
            interactiveReviewPdf: 'idle',
        });
        setIsGeneratingAll(false);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onAnalysisComplete(null);
    }

    if (analysisState === 'analyzing') {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-10 h-96">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                <p className="text-xl font-semibold">
                    Analizando tu documento...
                </p>
                <p className="text-muted-foreground mt-2">Esto puede tardar unos momentos. No cierres esta página.</p>
            </Card>
        );
    }
    
    if(analysisResult) {
        return (
             <div className="space-y-6">
                <Card>
                    <CardHeader className="p-4 pb-0">
                        <CardTitle className="flex items-center gap-3">
                            <BookOpen className="h-6 w-6 text-primary"/>
                            <span className="text-xl">Análisis del Curso: "{analysisResult.subjectArea}"</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <Tabs defaultValue="summary" className="w-full">
                            <TabsList className="relative w-full overflow-x-auto flex justify-start mb-4 border-b">
                                <TabsTrigger value="summary">Resumen</TabsTrigger>
                                <TabsTrigger value="structure">Estructura</TabsTrigger>
                                <TabsTrigger value="assessments">Evaluaciones</TabsTrigger>
                                <TabsTrigger value="bibliography">Bibliografía</TabsTrigger>
                                <TabsTrigger value="resources">Recursos</TabsTrigger>
                            </TabsList>

                            <TabsContent value="summary" className="space-y-6">
                                <p>{analysisResult.summary}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {analysisResult.weeks && (
                                        <div className="bg-secondary/30 p-4 rounded-lg flex-1">
                                            <div className="flex items-center gap-3 text-lg font-semibold"><Calendar className="h-6 w-6" /> Duración Estimada</div>
                                            <p className="text-primary text-3xl font-bold mt-2">{analysisResult.weeks} {typeof analysisResult.weeks === 'number' && analysisResult.weeks > 1 ? 'Semanas' : 'Semana'}</p>
                                        </div>
                                    )}
                                    {analysisResult.keyConcepts && (
                                        <div className="bg-secondary/30 p-4 rounded-lg flex-1 break-words">
                                            <div className="flex items-center gap-3 text-lg font-semibold"><BookCopy className="h-6 w-6" /> Conceptos Clave</div>
                                            <div className="flex flex-wrap gap-2 justify-start mt-2">
                                                {analysisResult.keyConcepts.map((concept, i) => (
                                                    <span key={i} className="bg-primary text-primary-foreground font-medium px-3 py-1 rounded-full text-xs">{concept}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="border-t pt-6 flex flex-wrap gap-4">
                                     <GenerationButton title="Generar Guía de Trabajo" materialType="workGuide" icon={FileText} />
                                     <GenerationButton title="Generar Repaso Interactivo" materialType="interactiveReviewPdf" icon={Lightbulb} />
                                </div>
                            </TabsContent>

                            <TabsContent value="structure" className="space-y-6">
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
                                        <div className="border-t pt-6 mt-6">
                                            <GenerationButton title="Generar Presentación" materialType="powerpointPresentation" icon={Presentation} />
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="assessments" className="space-y-6">
                                {analysisResult.assessments && (
                                    <div>
                                        <h3 className="font-semibold text-xl mb-3 flex items-center gap-2"><PencilRuler className="h-6 w-6 text-primary"/> Evaluaciones Planificadas</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {analysisResult.assessments.map((assessment, i) => (
                                                <div key={i} className="p-4 rounded-lg bg-secondary/30 break-words">
                                                    <div className="font-semibold">{assessment.type}</div>
                                                    <p className="text-sm text-muted-foreground mt-1">{assessment.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t pt-6 mt-6">
                                             <GenerationButton title="Generar Examen de Ejemplo" materialType="exampleTests" icon={ClipboardCheck} />
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                            
                            <TabsContent value="bibliography" className="space-y-6">
                                {analysisResult.bibliography && (
                                    <div>
                                        <h3 className="font-semibold text-xl mb-3">Bibliografía</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {analysisResult.bibliography.mentioned && analysisResult.bibliography.mentioned.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Mencionada en el Documento</h4>
                                                <ul className="list-disc list-inside text-sm text-muted-foreground bg-secondary/30 p-4 rounded-lg space-y-2 break-words">
                                                    {analysisResult.bibliography.mentioned.map((item, i) => <li key={i}>{item}</li>)}
                                                </ul>
                                            </div>
                                            )}
                                            {analysisResult.bibliography.recommended && analysisResult.bibliography.recommended.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Recomendada por Sand Classmate</h4>
                                                <ul className="list-disc list-inside text-sm text-muted-foreground bg-secondary/30 p-4 rounded-lg space-y-2 break-words">
                                                    {analysisResult.bibliography.recommended.map((item, i) => <li key={i}>{item}</li>)}
                                                </ul>
                                            </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="resources" className="space-y-6">
                                {analysisResult.enrichedContent?.externalLinks && analysisResult.enrichedContent.externalLinks.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-xl mb-3">Recursos Externos Sugeridos</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {analysisResult.enrichedContent.externalLinks.map((link, i) => (
                                                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg bg-secondary/30 hover:bg-accent/40 transition-colors break-words">
                                                    <div className="font-semibold flex items-center gap-2 text-primary"><LinkIcon className="h-4 w-4"/> {link.title}</div>
                                                    <p className="text-xs text-muted-foreground mt-1">{link.summary}</p>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                    {analysisResult.enrichedContent?.youtubeVideos && analysisResult.enrichedContent.youtubeVideos.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-xl mb-3">Videos de YouTube Recomendados</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {analysisResult.enrichedContent.youtubeVideos.map((video, i) => (
                                                <a key={i} href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg bg-secondary/30 hover:bg-accent/40 transition-colors break-words">
                                                    <div className="font-semibold flex items-center gap-2 text-red-600"><Youtube className="h-5 w-5"/> {video.title}</div>
                                                    <p className="text-xs text-muted-foreground mt-1">{video.summary}</p>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                    )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
                <div className="flex flex-col sm:flex-row gap-4">
                     <Button size="lg" className="w-full sm:w-auto flex-grow" onClick={handleGenerateAll} disabled={isAnyTaskRunning}>
                        {isGeneratingAll ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Download className="mr-2 h-5 w-5"/>}
                        Descargar Todo
                    </Button>
                    <Button onClick={resetState} variant="outline" size="lg" className="w-full sm:w-auto flex-grow" disabled={isAnyTaskRunning}>
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Analizar Otro Documento
                    </Button>
                </div>
             </div>
        );
    }

    const GenerationButton = ({title, materialType, icon: Icon}: {title: string, materialType: MaterialKey, icon: React.ElementType}) => {
        const status = materialStatuses[materialType];
        const isGenerating = status === 'generating';
        const isSuccess = status === 'success';

        return (
             <Button 
                onClick={() => handleGenerationSubmit(materialType)} 
                disabled={isAnyTaskRunning || isSuccess}
                size="lg"
                className="w-full sm:w-auto"
            >
                {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 
                 isSuccess ? <CheckCircle2 className="mr-2 h-5 w-5" /> : 
                 <Icon className="mr-2 h-5 w-5" />}
                {isSuccess ? `${title.split(' ')[1]} Generado` : title}
            </Button>
        )
    };

    return (
        <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
                <form id="analysis-form" onSubmit={handleAnalysisSubmit} className="space-y-6">
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
                    <Button type="submit" form="analysis-form" disabled={analysisState !== 'idle' || !fileName} size="lg" className="w-full py-7 text-lg">
                        {analysisState === 'analyzing' ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <BookOpen className="mr-3 h-6 w-6" />}
                        Analizar Contenido
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
