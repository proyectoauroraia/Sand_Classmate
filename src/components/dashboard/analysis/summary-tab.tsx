
'use client';

import * as React from 'react';
import type { AnalysisResult } from '@/lib/types';
import { Calendar, BookCopy } from 'lucide-react';
import type { MaterialStatus } from './analysis-display';
import { GenerationButton } from './generation-button';

interface SummaryTabProps {
    analysisResult: AnalysisResult;
    statuses: Record<keyof any, MaterialStatus>;
    setStatuses: React.Dispatch<React.SetStateAction<Record<keyof any, MaterialStatus>>>;
    isAnyTaskRunning: boolean;
}

export const SummaryTab: React.FC<SummaryTabProps> = React.memo(({
    analysisResult,
    statuses,
    setStatuses,
    isAnyTaskRunning,
}) => {
    return (
        <div className="space-y-6">
            <p className="text-muted-foreground">{analysisResult.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysisResult.weeks && (
                    <div className="bg-secondary/30 p-4 rounded-lg flex-1">
                        <div className="flex items-center gap-3 text-lg font-semibold text-secondary-foreground"><Calendar className="h-6 w-6 text-primary" /> Duración Estimada</div>
                        <p className="text-primary text-4xl font-bold mt-2">{analysisResult.weeks} {typeof analysisResult.weeks === 'number' && analysisResult.weeks > 1 ? 'Semanas' : 'Semana'}</p>
                    </div>
                )}
                {analysisResult.keyConcepts && (
                    <div className="bg-secondary/30 p-4 rounded-lg flex-1 break-words">
                        <div className="flex items-center gap-3 text-lg font-semibold text-secondary-foreground"><BookCopy className="h-6 w-6 text-primary" /> Conceptos Clave</div>
                        <div className="flex flex-wrap gap-2 justify-start mt-3">
                            {analysisResult.keyConcepts.map((concept, i) => (
                                <span key={i} className="bg-primary/10 border border-primary/20 text-primary font-medium px-3 py-1 rounded-full text-xs">{concept}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="border-t pt-6 flex flex-wrap gap-4">
                 <GenerationButton
                    title="Generar Guía de Trabajo"
                    materialType="workGuide"
                    icon="fileText"
                    analysisResult={analysisResult}
                    status={statuses.workGuide}
                    setStatus={(s) => setStatuses(p => ({...p, workGuide: s}))}
                    isAnyTaskRunning={isAnyTaskRunning}
                />
                 <GenerationButton
                    title="Generar Repaso Interactivo"
                    materialType="interactiveReviewPdf"
                    icon="lightbulb"
                    analysisResult={analysisResult}
                    status={statuses.interactiveReviewPdf}
                    setStatus={(s) => setStatuses(p => ({...p, interactiveReviewPdf: s}))}
                    isAnyTaskRunning={isAnyTaskRunning}
                />
            </div>
        </div>
    );
});

SummaryTab.displayName = 'SummaryTab';
