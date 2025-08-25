
'use client';

import * as React from 'react';
import type { AnalysisResult } from '@/lib/types';
import { Calendar, BookCopy, Info, CheckCircle2, AlertTriangle, GitCommit } from 'lucide-react';
import type { MaterialStatus } from './analysis-display';
import { GenerationButton } from './generation-button';

interface SummaryTabProps {
    analysisResult: AnalysisResult;
    statuses: Record<keyof any, MaterialStatus>;
    setStatuses: React.Dispatch<React.SetStateAction<Record<keyof any, MaterialStatus>>>;
    isAnyTaskRunning: boolean;
}

const InfoCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-secondary/30 p-4 rounded-lg flex-1">
        <div className="flex items-center gap-3 text-lg font-semibold text-card-foreground mb-3">
            <Icon className="h-6 w-6 text-primary" />
            {title}
        </div>
        {children}
    </div>
);

export const SummaryTab: React.FC<SummaryTabProps> = React.memo(({
    analysisResult,
    statuses,
    setStatuses,
    isAnyTaskRunning,
}) => {
    return (
        <div className="space-y-6 pt-4">
            <InfoCard title="Resumen del Documento" icon={Info}>
                <p className="text-muted-foreground">{analysisResult.summary}</p>
            </InfoCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                
                <InfoCard title="Conceptos Clave" icon={BookCopy}>
                    {analysisResult.keyConcepts && analysisResult.keyConcepts.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {analysisResult.keyConcepts.map((concept, i) => (
                                <div key={i} className="bg-primary/10 border border-primary/20 text-primary-foreground font-medium px-3 py-1.5 rounded-full text-xs text-center flex items-center justify-center">
                                    {concept}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">No se extrajeron conceptos clave.</p>
                    )}
                </InfoCard>

                 <InfoCard title="Análisis de Coherencia" icon={GitCommit}>
                    <p className="text-muted-foreground text-sm leading-relaxed">{analysisResult.coherenceAnalysis}</p>
                </InfoCard>
                 
                 <InfoCard title="Fortalezas Detectadas" icon={CheckCircle2}>
                    {analysisResult.strengths && analysisResult.strengths.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {analysisResult.strengths.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-sm">No se detectaron fortalezas específicas.</p>
                    )}
                </InfoCard>
                
                 <InfoCard title="Debilidades Identificadas" icon={AlertTriangle}>
                     {analysisResult.weaknesses && analysisResult.weaknesses.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {analysisResult.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                     ) : (
                        <p className="text-muted-foreground text-sm">No se identificaron debilidades pedagógicas.</p>
                     )}
                </InfoCard>

            </div>

             <InfoCard title="Recomendaciones de Mejora" icon={AlertTriangle}>
                 {analysisResult.recommendations && analysisResult.recommendations.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {analysisResult.recommendations.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                 ) : (
                    <p className="text-muted-foreground text-sm">No hay recomendaciones de mejora por ahora.</p>
                 )}
            </InfoCard>

            <div className="border-t pt-6 flex flex-col sm:flex-row flex-wrap gap-4">
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
