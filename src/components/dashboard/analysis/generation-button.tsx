
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Presentation, FileText, ClipboardCheck, Lightbulb, Download } from 'lucide-react';
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
import { cn } from '@/lib/utils';


const ICONS: Record<string, React.ElementType> = {
    presentation: Presentation,
    fileText: FileText,
    clipboardCheck: ClipboardCheck,
    lightbulb: Lightbulb,
    download: Download,
};

type MaterialKey = keyof GeneratedMaterials;

interface GenerationButtonProps {
    title: string;
    materialType: MaterialKey | 'all';
    icon: keyof typeof ICONS;
    analysisResult: AnalysisResult;
    status: MaterialStatus;
    setStatus: (status: MaterialStatus) => void;
    isAnyTaskRunning: boolean;
    classContext?: { unitTitle: string; classTopic: string };
    isCompact?: boolean;
}

export const GenerationButton: React.FC<GenerationButtonProps> = ({
    title,
    materialType,
    icon,
    analysisResult,
    status,
    setStatus,
    isAnyTaskRunning,
    classContext,
    isCompact = false,
}) => {
    const { toast } = useToast();
    const IconComponent = ICONS[icon];
    
    const handleGenerationSubmit = async (format: 'docx' | 'pdf' | 'pptx') => {
        if (!analysisResult) return;
        setStatus('generating');

        try {
            if (materialType === 'all') {
                // This logic would need to be implemented to generate and zip all files.
                // For now, we'll just show a success state as a placeholder.
                console.log("Generating all materials...");
                await new Promise(res => setTimeout(res, 2000)); // Simulate generation
            } else {
                const response = await generateMaterialsActionFromAnalysis(analysisResult, materialType, format, classContext);
                if (response.error || !response.data) {
                    throw new Error(response.error || `No se pudo generar el material: ${materialType}`);
                }

                const link = document.createElement('a');
                link.href = response.data;
                
                 const fileName = classContext 
                    ? `presentacion_${classContext.classTopic.replace(/\s+/g, '_')}.pptx`
                    : {
                        powerpointPresentation: 'presentacion_completa.pptx',
                        workGuide: `guia_de_trabajo.${format}`,
                        exampleTests: `examen_de_ejemplo.${format}`,
                        interactiveReviewPdf: `repaso_interactivo.${format}`
                    }[materialType] || `material.${format}`;


                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                toast({
                    title: '¡Material Generado!',
                    description: `Tu archivo ${link.download} se ha descargado.`,
                    className: 'bg-green-100 border-green-300 text-green-800'
                });
            }
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

    const getButtonText = () => {
        if (isCompact) return title;
        if (isSuccess) {
            if (title.includes("Presentación")) return "PPT Generada";
            if (title.includes("Guía")) return "Guía Generada";
            if (title.includes("Examen")) return "Examen Generado";
            if (title.includes("Repaso")) return "Repaso Generado";
        }
        return title;
    }

    const buttonContent = isCompact ? (
         <>
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : 
             isSuccess ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
             IconComponent ? <IconComponent className="h-4 w-4" /> : null}
            <span className="sr-only">{title}</span>
        </>
    ) : (
        <>
            {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 
             isSuccess ? <CheckCircle2 className="mr-2 h-5 w-5 text-green-400" /> : 
             IconComponent ? <IconComponent className="mr-2 h-5 w-5" /> : null}
            {getButtonText()}
        </>
    );

    const triggerButton = (
        <Button 
            disabled={isAnyTaskRunning && !isGenerating || isSuccess}
            size={isCompact ? "icon" : "lg"}
            className={cn(isCompact ? "" : "w-full sm:w-auto", isSuccess ? "bg-green-600/20 text-green-600 border border-green-600/30 hover:bg-green-600/30" : "")}
            aria-label={isCompact ? title : undefined}
        >
           {buttonContent}
        </Button>
    );

     if (materialType === 'powerpointPresentation') {
        return (
             <div onClick={isAnyTaskRunning || isSuccess ? undefined : () => handleGenerationSubmit('pptx')}>
                {triggerButton}
            </div>
        );
    }

    return (
       <AlertDialog>
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
