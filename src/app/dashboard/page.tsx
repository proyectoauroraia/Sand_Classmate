
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
        <div className="space-y-8">
            <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">¿Qué vamos a crear hoy?</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Sube tu programa de estudios o apuntes (PDF) y deja que la IA genere presentaciones, guías y más para tus clases.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
                {/* Columna Principal */}
                <div className="lg:col-span-7 flex flex-col h-full">
                    <FileUploader onAnalysisComplete={handleAnalysisComplete} />
                </div>

                {/* Columna Secundaria */}
                <div className="lg:col-span-5 flex flex-col h-full">
                    <h2 className="text-2xl font-bold tracking-tight mb-4">Cursos Recientes</h2>
                    <div className="flex-grow">
                        <MaterialsHistory />
                    </div>
                </div>
                
            </div>
        </div>
    );
}
