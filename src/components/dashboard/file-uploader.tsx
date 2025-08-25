
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, BookOpen } from 'lucide-react';
import { analyzeContentAction } from '@/lib/actions';
import type { AnalysisResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

type AnalysisState = 'idle' | 'analyzing';

type FileUploaderProps = {
    onAnalysisComplete: (result: AnalysisResult | null) => void;
};

const PremiumUploadIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 text-primary">
        <circle cx="32" cy="32" r="30.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 8"/>
        <path d="M32 22V42M32 22L26 28M32 22L38 28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


export function FileUploader({ onAnalysisComplete }: FileUploaderProps) {
    const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;
        if (analysisState === 'analyzing') {
            setProgress(0);
            const totalDuration = 45000; // 45 seconds total simulation
            const initialFastDuration = 5000; // First 5s to get to 80%
            const remainingDuration = totalDuration - initialFastDuration;

            // Fast initial progress
            let startTime = Date.now();
            const animateFast = () => {
                const elapsedTime = Date.now() - startTime;
                const newProgress = Math.min(80, (elapsedTime / initialFastDuration) * 80);
                setProgress(newProgress);
                if (newProgress < 80) {
                    requestAnimationFrame(animateFast);
                }
            };
            animateFast();

            // Slower progress for the remainder
            timer = setTimeout(() => {
                startTime = Date.now();
                const animateSlow = () => {
                     const elapsedTime = Date.now() - startTime;
                     const newProgress = 80 + Math.min(15, (elapsedTime / remainingDuration) * 15); // Goes up to 95%
                     setProgress(newProgress);
                     if (newProgress < 95) {
                         requestAnimationFrame(animateSlow);
                     }
                };
                animateSlow();
            }, initialFastDuration);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [analysisState]);

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile) {
            // Client-side validation for file size and type
            if (selectedFile.size > 10 * 1024 * 1024) { // 10 MB
                const errorMsg = 'El archivo no debe superar los 10MB.';
                setError(errorMsg);
                toast({ variant: "destructive", title: "Archivo muy grande", description: errorMsg });
                setFile(null);
                if(fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
             if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
                const errorMsg = 'Solo se admiten archivos PDF y DOCX.';
                setError(errorMsg);
                toast({ variant: "destructive", title: "Formato no válido", description: errorMsg });
                setFile(null);
                if(fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleAnalysisSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!file) {
            setError('Por favor, selecciona un archivo para analizar.');
            return;
        }
        
        setAnalysisState('analyzing');
        setError(null);

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
            
            setProgress(100); // Analysis complete
            setTimeout(() => {
                onAnalysisComplete(response.data);
                toast({
                    title: "¡Análisis Completo!",
                    description: `Hemos analizado tu documento sobre "${response.data.subjectArea}".`,
                });
            }, 500); // Short delay to show 100%

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
            setError(errorMessage);
            setAnalysisState('idle');
            toast({
                variant: "destructive",
                title: "Falló el Análisis",
                description: errorMessage,
            });
        }
    };
    
    if (analysisState === 'analyzing') {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-10 h-full bg-primary/10">
                <div className="w-full max-w-md">
                     <h2 className="text-xl font-semibold text-primary/80">
                        Analizando tu documento...
                    </h2>
                     <p className="text-primary/70 mt-2 mb-6">
                        Esto puede tardar unos momentos. No cierres esta página.
                    </p>
                    <Progress value={progress} className="w-full h-3 bg-primary/20" />
                    <p className="text-sm font-medium text-primary/90 mt-3">{Math.round(progress)}%</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col bg-card">
            <form id="analysis-form" onSubmit={handleAnalysisSubmit} className="flex-grow flex flex-col">
                <CardContent className="p-6 flex-grow flex flex-col">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div 
                        className="flex flex-col items-center justify-center py-10 px-6 rounded-lg cursor-pointer transition-colors border-2 border-dashed border-border hover:bg-accent/50 flex-grow mt-4"
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={(e) => {
                            e.preventDefault();
                            handleFileChange(e.dataTransfer.files?.[0] || null)
                        }}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <PremiumUploadIcon />
                        <p className="text-base font-semibold text-foreground">
                            {file ? file.name : 'Haz clic o arrastra un archivo para subir'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Se admiten documentos PDF y DOCX (máx. 10MB)</p>
                        <Input 
                            ref={fileInputRef} 
                            id="syllabusFile" 
                            name="syllabusFile" 
                            type="file" 
                            className="hidden" 
                            accept=".pdf,.docx"
                            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" form="analysis-form" disabled={analysisState !== 'idle' || !file} size="lg" className="w-full py-7 text-base">
                       <BookOpen className="mr-3 h-5 w-5" />
                        Analizar Contenido
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
