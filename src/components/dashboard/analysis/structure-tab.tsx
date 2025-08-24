
'use client';

import * as React from 'react';
import type { AnalysisResult } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ListChecks } from 'lucide-react';
import type { MaterialStatus } from './analysis-display';
import { GenerationButton } from './generation-button';


interface StructureTabProps {
    analysisResult: AnalysisResult;
    statuses: Record<keyof any, MaterialStatus>;
    setStatuses: React.Dispatch<React.SetStateAction<Record<keyof any, MaterialStatus>>>;
    isAnyTaskRunning: boolean;
}

export const StructureTab: React.FC<StructureTabProps> = React.memo(({
    analysisResult,
    statuses,
    setStatuses,
    isAnyTaskRunning,
}) => {
    if (!analysisResult.courseStructure || analysisResult.courseStructure.length === 0) {
        return <p className="text-muted-foreground">No se pudo identificar una estructura de curso en el documento.</p>;
    }
    
    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold text-xl mb-3 flex items-center gap-2">
                    <ListChecks className="h-6 w-6 text-primary"/> Estructura del Curso y Objetivos
                </h3>
                <Accordion type="single" collapsible className="w-full">
                    {analysisResult.courseStructure.map((unit, i) => (
                        <AccordionItem value={`item-${i}`} key={i}>
                            <AccordionTrigger className="text-base font-medium hover:no-underline">{unit.title}</AccordionTrigger>
                            <AccordionContent>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-4">
                                    {unit.learningObjectives.map((obj, j) => <li key={j}>{obj}</li>)}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <div className="border-t pt-6 mt-6">
                    <GenerationButton
                        title="Generar Presentación"
                        materialType="powerpointPresentation"
                        icon="presentation"
                        analysisResult={analysisResult}
                        status={statuses.powerpointPresentation}
                        setStatus={(s) => setStatuses(p => ({...p, powerpointPresentation: s}))}
                        isAnyTaskRunning={isAnyTaskRunning}
                    />
                </div>
            </div>
        </div>
    );
});

StructureTab.displayName = 'StructureTab';
