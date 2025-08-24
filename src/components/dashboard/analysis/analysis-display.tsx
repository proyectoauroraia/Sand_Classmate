
'use client';

import * as React from 'react';
import type { AnalysisResult, GeneratedMaterials } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, RefreshCw, Download, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SummaryTab } from './summary-tab';
import { StructureTab } from './structure-tab';
import { AssessmentsTab } from './assessments-tab';
import { BibliographyTab } from './bibliography-tab';

type MaterialKey = keyof GeneratedMaterials;
export type MaterialStatus = 'idle' | 'generating' | 'success';

interface AnalysisDisplayProps {
  analysisResult: AnalysisResult;
  onReset: () => void;
}

export function AnalysisDisplay({ analysisResult, onReset }: AnalysisDisplayProps) {
    const [materialStatuses, setMaterialStatuses] = React.useState<Record<MaterialKey, MaterialStatus>>({
        powerpointPresentation: 'idle',
        workGuide: 'idle',
        exampleTests: 'idle',
        interactiveReviewPdf: 'idle',
    });
    const [isGeneratingAll, setIsGeneratingAll] = React.useState(false);

    const isAnyTaskRunning = isGeneratingAll || Object.values(materialStatuses).some(s => s === 'generating');

    const handleGenerateAll = async () => {
        setIsGeneratingAll(true);
        // In a real app, you'd trigger all generation actions here.
        // For this example, we'll just simulate it.
        console.log("Generating all materials...");
        // This is a simplified approach. A better one would use a shared generation function.
        setIsGeneratingAll(false);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="p-4 pb-0">
                    <div className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-primary"/>
                        <h2 className="text-xl font-semibold">Análisis del Curso: "{analysisResult.subjectArea}"</h2>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <Tabs defaultValue="summary" className="w-full">
                        <TabsList className="relative w-full overflow-x-auto flex justify-start mb-4 border-b">
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
            <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="w-full sm:w-auto flex-grow" onClick={handleGenerateAll} disabled={isAnyTaskRunning}>
                    {isGeneratingAll ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Download className="mr-2 h-5 w-5"/>}
                    Descargar Todo
                </Button>
                <Button onClick={onReset} variant="outline" size="lg" className="w-full sm:w-auto flex-grow" disabled={isAnyTaskRunning}>
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Analizar Otro Documento
                </Button>
            </div>
        </div>
    );
}
