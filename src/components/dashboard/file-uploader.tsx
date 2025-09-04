
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, BookOpen, UploadCloud } from 'lucide-react';
import { analyzeContentAction } from '@/lib/actions';
import type { AnalysisResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

type AnalysisState = 'idle' | 'analyzing';

type FileUploaderProps = {
    onAnalysisComplete: (result: AnalysisResult | null) => void;
};

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
            const totalDuration = 60000; 
            const initialFastDuration = 8000; 
            const remainingDuration = totalDuration - initialFastDuration;

            let startTime = Date.now();
            const animateFast = () => {
                const elapsedTime = Date.now() - startTime;
                const newProgress = Math.min(70, (elapsedTime / initialFastDuration) * 70);
                setProgress(newProgress);
                if (newProgress < 70 && analysisState === 'analyzing') { 
                    requestAnimationFrame(animateFast);
                }
            };
            animateFast();

            timer = setTimeout(() => {
                if (analysisState !== 'analyzing') return; 
                startTime = Date.now();
                const animateSlow = () => {
                     const elapsedTime = Date.now() - startTime;
                     const newProgress = 70 + Math.min(25, (elapsedTime / remainingDuration) * 25); 
                     setProgress(newProgress);
                     if (newProgress < 95 && analysisState === 'analyzing') {
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
            
            setProgress(100); 
            setTimeout(() => {
                onAnalysisComplete(response.data);
                toast({
                    title: "¡Análisis Completo!",
                    description: `Hemos analizado tu documento sobre "${response.data.subjectArea}".`,
                });
            }, 500);

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
            <div className="flex flex-col items-center justify-center text-center p-10 h-full bg-card/80 backdrop-blur-sm border border-border/20 rounded-xl shadow-lg">
                <div className="w-full max-w-md">
                     <h2 className="text-xl font-semibold text-primary">
                        Analizando tu documento...
                    </h2>
                     <p className="text-muted-foreground mt-2 mb-6">
                        Esto puede tardar entre 30 y 60 segundos. No cierres esta página.
                    </p>
                    <Progress value={progress} className="w-full h-2 bg-primary/20" />
                    <p className="text-sm font-medium text-primary mt-3">{Math.round(progress)}%</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6 bg-card/80 backdrop-blur-sm border border-border/20 rounded-xl shadow-lg">
            <form id="analysis-form" onSubmit={handleAnalysisSubmit} className="flex-grow flex flex-col">
                <div 
                    className="flex-grow flex flex-col items-center justify-center text-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={(e) => {
                        e.preventDefault();
                        handleFileChange(e.dataTransfer.files?.[0] || null)
                    }}
                    onDragOver={(e) => e.preventDefault()}
                >
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <UploadCloud className="h-12 w-12 text-primary mb-4" />
                    <p className="text-base font-semibold text-card-foreground text-center">
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
                <div className="mt-6">
                    <Button type="submit" form="analysis-form" disabled={analysisState !== 'idle' || !file} size="lg" className="w-full py-6 text-base">
                       <BookOpen className="mr-2 h-5 w-5" />
                        Analizar Contenido
                    </Button>
                </div>
            </form>
        </div>
    );
}
