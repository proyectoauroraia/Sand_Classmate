
'use client';
import { useState } from 'react';
import { FileUploader } from '@/components/dashboard/file-uploader';
import { MaterialsHistory } from '@/components/dashboard/materials-history';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleAnalysisComplete = (result: any) => {
        setAnalysisResult(result);
    };

    return (
        <div className="space-y-8">
            <div className="text-left">
                 <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">¿Qué vamos a crear hoy?</h1>
                 <p className="text-muted-foreground mt-2 max-w-2xl">
                    Sube tu programa de estudios o apuntes (PDF) y deja que la IA genere presentaciones, guías y más para tus clases.
                </p>
            </div>
            
            <div className="max-w-5xl">
                <FileUploader onAnalysisComplete={handleAnalysisComplete} />
            </div>

            {!analysisResult && (
                 <>
                    <Separator className="my-8" />
                    <div className="space-y-4">
                         <h2 className="text-2xl font-bold tracking-tight">Cursos Recientes</h2>
                         <MaterialsHistory />
                    </div>
                </>
            )}

        </div>
    );
}
