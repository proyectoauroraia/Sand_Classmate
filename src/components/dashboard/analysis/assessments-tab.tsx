
'use client';

import * as React from 'react';
import type { AnalysisResult } from '@/lib/types';
import { PencilRuler } from 'lucide-react';
import type { MaterialStatus } from './analysis-display';
import { GenerationButton } from './generation-button';
import { ResultCard } from './result-card';

interface AssessmentsTabProps {
    analysisResult: AnalysisResult;
    statuses: Record<keyof any, MaterialStatus>;
    setStatuses: React.Dispatch<React.SetStateAction<Record<keyof any, MaterialStatus>>>;
    isAnyTaskRunning: boolean;
}

export const AssessmentsTab: React.FC<AssessmentsTabProps> = React.memo(({
    analysisResult,
    statuses,
    setStatuses,
    isAnyTaskRunning,
}) => {
    if (!analysisResult.assessments || analysisResult.assessments.length === 0) {
        return <p className="text-muted-foreground">No se encontraron evaluaciones en el documento.</p>;
    }
    
    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold text-xl mb-3 flex items-center gap-2">
                    <PencilRuler className="h-6 w-6 text-primary"/> Evaluaciones Planificadas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.assessments.map((assessment, i) => (
                        <ResultCard key={i} title={assessment.type} description={assessment.description} />
                    ))}
                </div>
                <div className="border-t pt-6 mt-6">
                    <GenerationButton
                        title="Generar Examen de Ejemplo"
                        materialType="exampleTests"
                        icon="clipboardCheck"
                        analysisResult={analysisResult}
                        status={statuses.exampleTests}
                        setStatus={(s) => setStatuses(p => ({...p, exampleTests: s}))}
                        isAnyTaskRunning={isAnyTaskRunning}
                    />
                </div>
            </div>
        </div>
    );
});

AssessmentsTab.displayName = 'AssessmentsTab';
