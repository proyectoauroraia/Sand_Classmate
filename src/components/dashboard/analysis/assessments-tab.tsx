
'use client';

import * as React from 'react';
import type { AnalysisResult } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PencilRuler, Goal, FileSignature } from 'lucide-react';
import type { MaterialStatus } from './analysis-display';
import { GenerationButton } from './generation-button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
        return <div className="text-muted-foreground p-8 text-center">No se encontraron evaluaciones en el documento.</div>;
    }
    
    return (
        <div className="space-y-6 pt-4">
            <div>
                <h3 className="font-semibold text-lg md:text-xl mb-4 flex items-center gap-2">
                    <PencilRuler className="h-6 w-6 text-primary"/> Evaluaciones Planificadas
                </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {analysisResult.assessments.map((assessment, i) => (
                       <Card key={i} className="flex flex-col bg-secondary/30">
                           <CardHeader>
                               <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                   <FileSignature className="h-5 w-5 text-primary"/>
                                   {assessment.type}
                               </CardTitle>
                               <CardDescription>{assessment.description}</CardDescription>
                           </CardHeader>
                           <CardContent className="flex-grow space-y-3">
                                <div className="text-sm">
                                    <p className="font-semibold text-card-foreground mb-1">Resultado de Aprendizaje:</p>
                                    <p className="text-muted-foreground text-xs leading-relaxed">{assessment.feedback}</p>
                                </div>
                           </CardContent>
                           <CardFooter>
                                <GenerationButton
                                    title="Generar Examen de Ejemplo"
                                    materialType="exampleTests"
                                    icon="clipboardCheck"
                                    analysisResult={{ ...analysisResult, assessments: [assessment] }}
                                    status={statuses[`test-${i}`] || 'idle'}
                                    setStatus={(s) => setStatuses(p => ({...p, [`test-${i}`]: s}))}
                                    isAnyTaskRunning={isAnyTaskRunning}
                                />
                           </CardFooter>
                       </Card>
                    ))}
                </div>
            </div>
        </div>
    );
});

AssessmentsTab.displayName = 'AssessmentsTab';
