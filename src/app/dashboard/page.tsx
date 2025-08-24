
'use client';
import { useState } from 'react';
import { FileUploader } from '@/components/dashboard/file-uploader';
import { MaterialsHistory } from '@/components/dashboard/materials-history';
import { AnalysisDisplay } from '@/components/dashboard/analysis/analysis-display';
import type { AnalysisResult } from '@/lib/types';

export default function DashboardPage() {
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

    const handleAnalysisComplete = (result: AnalysisResult | null) => {
        setAnalysisResult(result);
    };

    const handleReset = () => {
        setAnalysisResult(null);
    }

    if (analysisResult) {
        return (
            <AnalysisDisplay 
                analysisResult={analysisResult}
                onReset={handleReset}
            />
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
           
            {/* Columna Principal (Ocupa 3/5 del espacio) */}
            <div className="lg:col-span-3 space-y-6">
                 <div className="text-left">
                     <h1 className="text-3xl font-bold tracking-tight">¿Qué vamos a crear hoy?</h1>
                     <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
                        Sube tu programa de estudios o apuntes (PDF) y deja que la IA genere presentaciones, guías y más para tus clases.
                    </p>
                </div>
                <FileUploader onAnalysisComplete={handleAnalysisComplete} />
            </div>

            {/* Columna Secundaria (Ocupa 2/5 del espacio) */}
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Cursos Recientes</h2>
                <MaterialsHistory />
            </div>
            
        </div>
    );
}
