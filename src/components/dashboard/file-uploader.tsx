
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, BookOpen, UploadCloud, Loader2, CheckCircle2 } from 'lucide-react';
import { startAnalysisAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

type UploadState = 'idle' | 'uploading' | 'processing' | 'success';

type FileUploaderProps = {
    onAnalysisComplete: (result: any | null) => void; // This will change, result is now async
};

export function FileUploader({ onAnalysisComplete }: FileUploaderProps) {
    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const supabase = createClient();

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10 MB
                const errorMsg = 'El archivo no debe superar los 10MB.';
                setError(errorMsg);
                toast({ variant: "destructive", title: "Archivo muy grande", description: errorMsg });
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
                const errorMsg = 'Solo se admiten archivos PDF y DOCX.';
                setError(errorMsg);
                toast({ variant: "destructive", title: "Formato no válido", description: errorMsg });
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
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

        setUploadState('uploading');
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Debes iniciar sesión para subir archivos.");

            // 1. Upload file to Supabase Storage
            const path = `user-${user.id}/${Date.now()}-${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('uploads') // Make sure this bucket is created and private
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            setUploadState('processing');

            // 2. Call server action with the file key
            const { analysisId, error: actionError } = await startAnalysisAction({ fileKey: uploadData.path });

            if (actionError) throw new Error(actionError);

            setUploadState('success');
            toast({
                title: "¡Análisis en progreso!",
                description: `Tu documento "${file.name}" se está analizando. Los resultados aparecerán en tu biblioteca pronto.`,
            });
            // Reset after a delay
            setTimeout(() => {
                setFile(null);
                setUploadState('idle');
            }, 3000);

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
            setError(errorMessage);
            setUploadState('idle');
            toast({
                variant: "destructive",
                title: "Falló la subida o el análisis",
                description: errorMessage,
            });
        }
    };

    const renderContent = () => {
        switch (uploadState) {
            case 'uploading':
            case 'processing':
                return (
                    <div className="flex flex-col items-center justify-center text-center p-10 h-full">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                        <h2 className="text-xl font-semibold text-primary">
                            {uploadState === 'uploading' ? 'Subiendo archivo...' : 'Iniciando análisis...'}
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            Por favor, espera un momento.
                        </p>
                    </div>
                );
            case 'success':
                 return (
                    <div className="flex flex-col items-center justify-center text-center p-10 h-full">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                        <h2 className="text-xl font-semibold text-green-500">
                           Análisis iniciado
                        </h2>
                        <p className="text-muted-foreground mt-2">
                           Revisa tu biblioteca en un momento para ver los resultados.
                        </p>
                    </div>
                );
            case 'idle':
            default:
                return (
                     <div 
                        className="flex-grow flex flex-col items-center justify-center text-center cursor-pointer p-4"
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
                )
        }
    };

    return (
        <div className="h-full flex flex-col p-6 bg-card/80 backdrop-blur-sm border border-border/20 rounded-xl shadow-lg">
            <form id="analysis-form" onSubmit={handleAnalysisSubmit} className="flex-grow flex flex-col">
                {renderContent()}
                <div className="mt-6">
                    <Button type="submit" form="analysis-form" disabled={uploadState !== 'idle' || !file} size="lg" className="w-full py-6 text-base">
                       <BookOpen className="mr-2 h-5 w-5" />
                        Analizar Contenido
                    </Button>
                </div>
            </form>
        </div>
    );
}

