
'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Presentation, FileText, ClipboardCheck, Lightbulb, Download } from 'lucide-react';
import type { GeneratedMaterials, AnalysisResult } from '@/lib/types';
import { generateMaterialsActionFromAnalysis, createPptxAction } from '@/lib/actions';
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
import { Skeleton } from '@/components/ui/skeleton';

const PresentationPreview = dynamic(() => import('./presentation-preview').then(mod => mod.PresentationPreview), {
    loading: () => <div className="p-8"><Skeleton className="w-full h-96" /></div>,
    ssr: false,
});


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
    materialType: MaterialKey | 'powerpointPresentation';
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

    // State for presentation preview
    const [showPreview, setShowPreview] = React.useState(false);
    const [markdownContent, setMarkdownContent] = React.useState<string | null>(null);
    
    const handleGenerationSubmit = async (format: 'docx' | 'pdf') => {
        if (!analysisResult) return;
        setStatus('generating');

        try {
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
    
    const handlePresentationGeneration = async () => {
        if (!analysisResult) return;
        setStatus('generating');
        
        try {
             // Step 1: Generate only the markdown content
            const response = await generateMaterialsActionFromAnalysis(analysisResult, 'powerpointPresentation', 'pptx', classContext);
            if (response.error || !response.data) {
                throw new Error(response.error || 'No se pudo generar el contenido de la presentación.');
            }
            
            // Step 2: Show the preview modal with the generated content
            setMarkdownContent(response.data);
            setShowPreview(true);
            setStatus('idle'); // Reset status as the main task is done, preview is next step

        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
            toast({
                variant: 'destructive',
                title: 'Error al Preparar la Vista Previa',
                description: errorMessage,
            });
            setStatus('idle');
        }
    };

    const handleDownloadPptx = async (finalMarkdown: string, theme: string) => {
        setStatus('generating');
        setShowPreview(false); // Close the modal
        
        try {
            const response = await createPptxAction(finalMarkdown, theme);
             if (response.error || !response.data) {
                throw new Error(response.error || 'No se pudo crear el archivo PPTX.');
            }

            const link = document.createElement('a');
            link.href = response.data;
            const fileName = classContext 
                ? `presentacion_${classContext.classTopic.replace(/\s+/g, '_')}.pptx`
                : 'presentacion_completa.pptx';
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: '¡Presentación Descargada!',
                description: `Tu archivo ${fileName} se ha descargado.`,
            });
            setStatus('success');

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
            toast({
                variant: "destructive",
                title: "Falló la Descarga",
                description: errorMessage,
            });
            setStatus('idle');
        }
    }

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
            <>
                <div onClick={(e) => {
                  e.preventDefault();
                  if (!isAnyTaskRunning && !isSuccess) {
                    handlePresentationGeneration();
                  }
                }}>
                    {triggerButton}
                </div>
                {showPreview && markdownContent && (
                    <PresentationPreview
                        initialMarkdown={markdownContent}
                        onClose={() => setShowPreview(false)}
                        onDownload={handleDownloadPptx}
                        isLoading={isGenerating}
                    />
                )}
            </>
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
