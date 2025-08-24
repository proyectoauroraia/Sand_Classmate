
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, Loader2, RefreshCw, AlertCircle, BookOpen } from 'lucide-react';
import { analyzeContentAction } from '@/lib/actions';
import type { AnalysisResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { AnalysisDisplay } from '@/components/dashboard/analysis/analysis-display';


type AnalysisState = 'idle' | 'analyzing' | 'success';

type FileUploaderProps = {
    onAnalysisComplete: (result: AnalysisResult | null) => void;
};


export function FileUploader({ onAnalysisComplete }: FileUploaderProps) {
    const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

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
        
        if (file.size > 10 * 1024 * 1024) { // 10 MB limit
            setError('El archivo es demasiado grande. El límite es de 10MB.');
            toast({
                variant: "destructive",
                title: "Archivo muy grande",
                description: "Por favor, sube un archivo de menos de 10MB.",
            });
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
            setAnalysisState('success');
            onAnalysisComplete(response.data);
            toast({
                title: "¡Análisis Completo!",
                description: `Hemos analizado tu documento sobre "${response.data.subjectArea}".`,
                className: "bg-green-100 border-green-300 text-green-800"
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

    const resetState = () => {
        setAnalysisState('idle');
        setError(null);
        setAnalysisResult(null);
        setFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onAnalysisComplete(null);
    }
    
    if (analysisState === 'analyzing') {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-10 h-96">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                <h2 className="text-xl font-semibold">
                    Analizando tu documento...
                </h2>
                <p className="text-muted-foreground mt-2">Esto puede tardar unos momentos. No cierres esta página.</p>
            </Card>
        );
    }
    
    if (analysisState === 'success' && analysisResult) {
        return (
            <AnalysisDisplay 
                analysisResult={analysisResult}
                onReset={resetState}
            />
        )
    }

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
                        onDrop={(e) => {
                            e.preventDefault();
                            handleFileChange(e.dataTransfer.files?.[0] || null)
                        }}
                        onDragOver={(e) => e.preventDefault()}
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
                       <BookOpen className="mr-3 h-6 w-6" />
                        Analizar Contenido
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
