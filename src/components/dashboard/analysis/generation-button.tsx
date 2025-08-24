
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Presentation, FileText, ClipboardCheck, Lightbulb } from 'lucide-react';
import type { GeneratedMaterials, AnalysisResult } from '@/lib/types';
import { generateMaterialsActionFromAnalysis } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { MaterialStatus } from './analysis-display';

const ICONS: Record<string, React.ElementType> = {
    presentation: Presentation,
    fileText: FileText,
    clipboardCheck: ClipboardCheck,
    lightbulb: Lightbulb,
};

type MaterialKey = keyof GeneratedMaterials;

interface GenerationButtonProps {
    title: string;
    materialType: MaterialKey;
    icon: keyof typeof ICONS;
    analysisResult: AnalysisResult;
    status: MaterialStatus;
    setStatus: (status: MaterialStatus) => void;
    isAnyTaskRunning: boolean;
}

export const GenerationButton: React.FC<GenerationButtonProps> = ({
    title,
    materialType,
    icon,
    analysisResult,
    status,
    setStatus,
    isAnyTaskRunning,
}) => {
    const { toast } = useToast();
    const IconComponent = ICONS[icon];
    
    const handleGenerationSubmit = async () => {
        if (!analysisResult) return;

        setStatus('generating');

        try {
            const response = await generateMaterialsActionFromAnalysis(analysisResult, materialType);
            if (response.error || !response.data) {
                throw new Error(response.error || `No se pudo generar el material: ${materialType}`);
            }

            const link = document.createElement('a');
            link.href = response.data;
            
            const fileNames: Record<MaterialKey, string> = {
                powerpointPresentation: 'presentacion.pptx',
                workGuide: 'guia_de_trabajo.pdf',
                exampleTests: 'examen_de_ejemplo.pdf',
                interactiveReviewPdf: 'repaso_interactivo.pdf'
            };

            link.download = fileNames[materialType] || 'material.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

             toast({
                title: '¡Material Generado!',
                description: `Tu ${fileNames[materialType]} se ha descargado.`,
                className: 'bg-green-100 border-green-300 text-green-800'
            });
            setStatus('success');

        } catch (e) {
             const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
            toast({
              variant: "destructive",
              title: "Falló la Generación",
              description: errorMessage,
            });
            setStatus('idle');
        }
    };
    
    const isGenerating = status === 'generating';
    const isSuccess = status === 'success';

    return (
        <Button 
            onClick={handleGenerationSubmit} 
            disabled={isAnyTaskRunning || isSuccess}
            size="lg"
            className="w-full sm:w-auto"
        >
            {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 
             isSuccess ? <CheckCircle2 className="mr-2 h-5 w-5" /> : 
             IconComponent ? <IconComponent className="mr-2 h-5 w-5" /> : null}
            {isSuccess ? `${title.split(' ')[1]} Generado` : title}
        </Button>
    );
};
