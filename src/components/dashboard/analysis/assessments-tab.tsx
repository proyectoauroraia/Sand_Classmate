
'use client';

import * as React from 'react';
import type { AnalysisResult } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PencilRuler, Goal, FileSignature } from 'lucide-react';
import type { MaterialStatus } from './analysis-display';
import { GenerationButton } from './generation-button';

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
                 <Accordion type="single" collapsible className="w-full space-y-2">
                    {analysisResult.assessments.map((assessment, i) => (
                        <AccordionItem value={`item-${i}`} key={i} className="bg-secondary/30 rounded-lg px-4 border-b-0">
                            <AccordionTrigger className="text-base font-medium hover:no-underline py-4">
                               {assessment.type}
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pb-4">
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold flex items-center gap-2 mb-2"><FileSignature className="h-5 w-5"/>Descripción</h4>
                                    <p className="text-sm text-muted-foreground">{assessment.description}</p>
                                </div>
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold flex items-center gap-2 mb-2"><Goal className="h-5 w-5"/>Resultado de Aprendizaje y Retroalimentación</h4>
                                    <p className="text-sm text-muted-foreground">{assessment.feedback}</p>
                                </div>
                                <div className="border-t pt-4 flex justify-end">
                                     <GenerationButton
                                        title="Generar Examen de Ejemplo"
                                        materialType="exampleTests"
                                        icon="clipboardCheck"
                                        analysisResult={{ ...analysisResult, assessments: [assessment] }}
                                        status={statuses.exampleTests}
                                        setStatus={(s) => setStatuses(p => ({...p, exampleTests: s}))}
                                        isAnyTaskRunning={isAnyTaskRunning}
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <div className="border-t pt-6 mt-6">
                    <GenerationButton
                        title="Generar Todos los Examenes de Ejemplo"
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
