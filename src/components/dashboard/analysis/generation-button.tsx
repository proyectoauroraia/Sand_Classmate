
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Presentation, FileText, ClipboardCheck, Lightbulb } from 'lucide-react';
import type { GeneratedMaterials, AnalysisResult } from '@/lib/types';
import { generateMaterialsActionFromAnalysis } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { MaterialStatus } from './analysis-display';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


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
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    
    const handleGenerationSubmit = async (format: 'docx' | 'pdf') => {
        if (!analysisResult) return;
        setIsDialogOpen(false);
        setStatus('generating');

        try {
            const response = await generateMaterialsActionFromAnalysis(analysisResult, materialType, format);
            if (response.error || !response.data) {
                throw new Error(response.error || `No se pudo generar el material: ${materialType}`);
            }

            const link = document.createElement('a');
            link.href = response.data;
            
            const fileExtensions = {
                powerpointPresentation: 'pptx',
                workGuide: format,
                exampleTests: format,
                interactiveReviewPdf: format
            };

            const fileNames: Record<MaterialKey, string> = {
                powerpointPresentation: 'presentacion.pptx',
                workGuide: `guia_de_trabajo.${fileExtensions.workGuide}`,
                exampleTests: `examen_de_ejemplo.${fileExtensions.exampleTests}`,
                interactiveReviewPdf: `repaso_interactivo.${fileExtensions.interactiveReviewPdf}`
            };

            link.download = fileNames[materialType] || `material.${fileExtensions[materialType]}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

             toast({
                title: '¡Material Generado!',
                description: `Tu ${link.download} se ha descargado.`,
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

    const triggerButton = (
        <Button 
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

     if (materialType === 'powerpointPresentation') {
        return (
             <div onClick={() => handleGenerationSubmit('docx')}>
                {triggerButton}
            </div>
        );
    }

    return (
       <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
                {triggerButton}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Elige un formato de descarga</AlertDialogTitle>
                    <AlertDialogDescription>
                        Selecciona si prefieres un archivo Word (.docx) para editar o un PDF (.pdf) para compartir fácilmente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleGenerationSubmit('docx')}>
                        Descargar como Word (.docx)
                    </AlertDialogAction>
                    <AlertDialogAction onClick={() => handleGenerationSubmit('pdf')}>
                        Descargar como PDF (.pdf)
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
