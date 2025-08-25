
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, RefreshCw, AlertCircle, BookOpen } from 'lucide-react';
import { analyzeContentAction } from '@/lib/actions';
import type { AnalysisResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

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

    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (file: File | null) => {
        if (file) {
            // Client-side validation for file size and type
            if (file.size > 10 * 1024 * 1024) { // 10 MB
                setError('El archivo no debe superar los 10MB.');
                toast({
                    variant: "destructive",
                    title: "Archivo muy grande",
                    description: "Por favor, sube un archivo de menos de 10MB.",
                });
                return;
            }
             if (!file.type.startsWith('application/pdf')) {
                setError('Solo se admiten archivos PDF.');
                toast({
                    variant: "destructive",
                    title: "Formato no válido",
                    description: "Por favor, sube un archivo en formato PDF.",
                });
                return;
            }
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
            
            onAnalysisComplete(response.data);
            toast({
                title: "¡Análisis Completo!",
                description: `Hemos analizado tu documento sobre "${response.data.subjectArea}".`,
            });
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
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                <h2 className="text-xl font-semibold text-primary/80">
                    Analizando tu documento...
                </h2>
                <p className="text-primary/70 mt-2">Esto puede tardar unos momentos. No cierres esta página.</p>
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
                        className="flex flex-col items-center justify-center py-10 px-6 rounded-lg cursor-pointer transition-colors border-2 border-dashed border-border hover:bg-accent/50 flex-grow"
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={(e) => {
                            e.preventDefault();
                            handleFileChange(e.dataTransfer.files?.[0] || null)
                        }}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <PremiumUploadIcon />
                        <p className="text-base font-semibold text-foreground">
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
                </CardContent>
                <CardFooter>
                    <Button type="submit" form="analysis-form" disabled={analysisState !== 'idle' || !fileName} size="lg" className="w-full py-7 text-base">
                       <BookOpen className="mr-3 h-5 w-5" />
                        Analizar Contenido
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
