
'use client';

import * as React from 'react';
import type { AnalysisResult } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ListChecks, BookCopy, Presentation } from 'lucide-react';
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
        return <p className="text-muted-foreground p-8 text-center">No se pudo identificar una estructura de curso en el documento.</p>;
    }
    
    return (
        <div className="space-y-6 pt-4">
            <div>
                <h3 className="font-semibold text-lg md:text-xl mb-3 flex items-center gap-2">
                    <ListChecks className="h-6 w-6 text-primary"/> Estructura del Curso y Objetivos
                </h3>
                <Accordion type="single" collapsible className="w-full">
                    {analysisResult.courseStructure.map((unit, i) => (
                        <AccordionItem value={`item-${i}`} key={i} className="border-secondary">
                            <AccordionTrigger className="text-base font-medium hover:no-underline text-left">{unit.title}</AccordionTrigger>
                            <AccordionContent className="space-y-4 bg-secondary/30 p-4 rounded-b-md">
                                <div>
                                    <h4 className="font-semibold text-sm mb-2 text-card-foreground">Resultados de Aprendizaje de la Unidad:</h4>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-4">
                                        {unit.learningObjectives.map((obj, j) => <li key={j}>{obj}</li>)}
                                    </ul>
                                </div>
                                <div className="border-t border-border pt-4">
                                    <h4 className="font-semibold text-sm mb-3 text-card-foreground">Clases de la Unidad ({unit.classes?.length || 0}):</h4>
                                     <div className="space-y-3">
                                        {unit.classes?.map((cls, j) => (
                                            <div key={j} className="flex items-center justify-between p-3 rounded-md bg-background/50">
                                                <div className="flex items-center gap-3">
                                                    <BookCopy className="h-5 w-5 text-primary/80 flex-shrink-0" />
                                                    <p className="font-medium text-sm text-foreground text-left">{cls.topic}</p>
                                                </div>
                                                <GenerationButton
                                                    title="Generar PPT"
                                                    materialType="powerpointPresentation"
                                                    icon="presentation"
                                                    analysisResult={analysisResult}
                                                    status={statuses[`ppt-${i}-${j}`] || 'idle'}
                                                    setStatus={(s) => setStatuses(p => ({ ...p, [`ppt-${i}-${j}`]: s }))}
                                                    isAnyTaskRunning={isAnyTaskRunning}
                                                    classContext={{ unitTitle: unit.title, classTopic: cls.topic }}
                                                    isCompact={true}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <div className="border-t border-border pt-6 mt-6">
                    <GenerationButton
                        title="Generar Presentación Completa"
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
