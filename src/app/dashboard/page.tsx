
'use client';
import { useState } from 'react';
import { FileUploader } from '@/components/dashboard/file-uploader';
import { MaterialsHistory } from '@/components/dashboard/materials-history';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { ChevronDown, Languages } from 'lucide-react';


export default function DashboardPage() {
    const [language, setLanguage] = useState("es");
    const [analysisResult, setAnalysisResult] = useState(null);

    // This function will be passed to FileUploader to update the parent state
    const handleAnalysisComplete = (result: any) => {
        setAnalysisResult(result);
    };


    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <Logo />
                    <span className="text-xl font-bold text-primary">Sand Classmate</span>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                            <Languages className="h-4 w-4" />
                            <span>{language === 'es' ? 'Español' : 'English'}</span>
                            <ChevronDown className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Seleccionar idioma</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={language} onValueChange={setLanguage}>
                            <DropdownMenuRadioItem value="es">Español</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            <div className="text-center">
                 <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">¿Qué vamos a crear hoy?</h1>
                 <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                    Sube tu programa de estudios o apuntes (PDF) y deja que la IA genere presentaciones, guías y más para tus clases.
                </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
                <FileUploader onAnalysisComplete={handleAnalysisComplete} />
            </div>

            {!analysisResult && (
                 <>
                    <Separator className="my-8" />
                    <MaterialsHistory />
                </>
            )}

        </div>
    );
}
