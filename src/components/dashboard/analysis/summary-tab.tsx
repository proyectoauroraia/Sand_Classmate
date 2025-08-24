
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
                
                <div className="bg-secondary/30 p-4 rounded-lg flex-1 break-words">
                    <div className="flex items-center gap-3 text-lg font-semibold text-card-foreground mb-4"><BookCopy className="h-6 w-6 text-primary" /> Conceptos Clave</div>
                    {analysisResult.keyConcepts && (
                        <div className="flex flex-wrap gap-2">
                            {analysisResult.keyConcepts.map((concept, i) => (
                                <div key={i} className="bg-primary/10 border border-primary/20 text-primary-foreground font-medium px-3 py-1.5 rounded-full text-xs text-center flex items-center justify-center">
                                    {concept}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                 {analysisResult.strengths && (
                    <div className="bg-secondary/30 p-4 rounded-lg flex-1">
                        <div className="flex items-center gap-3 text-lg font-semibold text-card-foreground mb-3"> Fortalezas Detectadas</div>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {analysisResult.strengths.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                )}
                 {analysisResult.weaknesses && (
                    <div className="bg-secondary/30 p-4 rounded-lg flex-1">
                        <div className="flex items-center gap-3 text-lg font-semibold text-card-foreground mb-3"> Debilidades Identificadas</div>
                         <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {analysisResult.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                )}
                 {analysisResult.recommendations && (
                    <div className="bg-secondary/30 p-4 rounded-lg flex-1">
                        <div className="flex items-center gap-3 text-lg font-semibold text-card-foreground mb-3"> Recomendaciones de Mejora</div>
                         <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {analysisResult.recommendations.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
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
