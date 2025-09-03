
'use client';

import * as React from 'react';
import type { AnalysisResult } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, RefreshCw, Download, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SummaryTab } from './summary-tab';
import { StructureTab } from './structure-tab';
import { AssessmentsTab } from './assessments-tab';
import { BibliographyTab } from './bibliography-tab';
import { GenerationButton } from './generation-button';

export type MaterialStatus = 'idle' | 'generating' | 'success';

interface AnalysisDisplayProps {
  analysisResult: AnalysisResult;
  onReset: () => void;
}

export function AnalysisDisplay({ analysisResult, onReset }: AnalysisDisplayProps) {
    const [materialStatuses, setMaterialStatuses] = React.useState<Record<string, MaterialStatus>>({});

    const isAnyTaskRunning = Object.values(materialStatuses).some(s => s === 'generating');

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-start gap-3">
                        <BookOpen className="h-6 w-6 text-primary mt-1 flex-shrink-0"/>
                        <h2 className="text-xl md:text-2xl font-semibold leading-tight">Análisis del Curso: "{analysisResult.subjectArea}"</h2>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="summary" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                            <TabsTrigger value="summary">Resumen</TabsTrigger>
                            <TabsTrigger value="structure">Estructura</TabsTrigger>
                            <TabsTrigger value="assessments">Evaluaciones</TabsTrigger>
                            <TabsTrigger value="bibliography">Bibliografía</TabsTrigger>
                        </TabsList>

                        <TabsContent value="summary">
                            <SummaryTab 
                                analysisResult={analysisResult} 
                                statuses={materialStatuses} 
                                setStatuses={setMaterialStatuses} 
                                isAnyTaskRunning={isAnyTaskRunning} 
                            />
                        </TabsContent>
                        <TabsContent value="structure">
                            <StructureTab 
                                analysisResult={analysisResult} 
                                statuses={materialStatuses} 
                                setStatuses={setMaterialStatuses} 
                                isAnyTaskRunning={isAnyTaskRunning} 
                            />
                        </TabsContent>
                        <TabsContent value="assessments">
                            <AssessmentsTab 
                                analysisResult={analysisResult} 
                                statuses={materialStatuses} 
                                setStatuses={setMaterialStatuses} 
                                isAnyTaskRunning={isAnyTaskRunning} 
                            />
                        </TabsContent>
                        <TabsContent value="bibliography">
                            <BibliographyTab analysisResult={analysisResult} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Button onClick={onReset} variant="outline" size="lg" disabled={isAnyTaskRunning} className="w-full sm:w-auto">
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Analizar Otro Documento
                </Button>
            </div>
        </div>
    );
}
