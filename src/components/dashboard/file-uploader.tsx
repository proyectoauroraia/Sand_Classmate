'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, Presentation, FileText, ClipboardCheck, MousePointerClick, Loader2, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { generateMaterialsAction } from '@/lib/actions';
import type { GeneratedMaterials } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export function FileUploader() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GeneratedMaterials | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (file: File | null) => {
        if (file) {
            setFileName(file.name);
            setError(null);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const file = fileInputRef.current?.files?.[0];

        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const dataUri = reader.result as string;
                const response = await generateMaterialsAction(dataUri);

                if (response.error || !response.data) {
                    throw new Error(response.error || 'Failed to generate materials.');
                }

                setResult(response.data);
                toast({
                  title: "Success!",
                  description: "Your course materials have been generated.",
                });
            };
            reader.onerror = () => {
                throw new Error('Could not read the file.');
            };
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
            setError(errorMessage);
            toast({
              variant: "destructive",
              title: "Generation Failed",
              description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setIsLoading(false);
        setError(null);
        setResult(null);
        setFileName(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-semibold">Generating your materials...</p>
                <p className="text-sm text-muted-foreground">This may take a few moments. Please don't close this page.</p>
            </div>
        );
    }
    
    if(result) {
        return (
            <div>
                <h3 className="text-lg font-semibold mb-4 font-headline">Your materials for "{fileName}" are ready!</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MaterialCard icon={Presentation} title="PowerPoint" description="PPTX Presentation" href={result.powerpointPresentation} fileName="presentation.pptx"/>
                    <MaterialCard icon={FileText} title="Work Guide" description="PDF document" href={result.workGuide} fileName="work-guide.pdf"/>
                    <MaterialCard icon={ClipboardCheck} title="Example Tests" description="PDF document" href={result.exampleTests} fileName="example-tests.pdf"/>
                    <MaterialCard icon={MousePointerClick} title="Interactive Review" description="Interactive PDF" href={result.interactiveReviewPdf} fileName="interactive-review.pdf"/>
                </div>
                 <Button onClick={resetState} className="mt-6">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate Another
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div 
                className={cn(
                    "flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors",
                    error && "border-destructive hover:border-destructive"
                )}
                onClick={() => fileInputRef.current?.click()}
            >
                <UploadCloud className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-lg font-semibold">
                    {fileName ? fileName : 'Click or drag file to this area to upload'}
                </p>
                <p className="text-sm text-muted-foreground">Supports PDF documents up to 10MB.</p>
                <Input 
                    ref={fileInputRef} 
                    id="syllabusFile" 
                    name="syllabusFile" 
                    type="file" 
                    className="hidden" 
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
            </div>
            <Button type="submit" disabled={isLoading || !fileName} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                Generate Materials
            </Button>
        </form>
    );
}

function MaterialCard({ icon: Icon, title, description, href, fileName }: { icon: React.ElementType, title: string, description: string, href: string, fileName: string }) {
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Icon className="h-12 w-12 text-primary mb-4" />
                <h4 className="text-md font-semibold font-headline">{title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{description}</p>
                <Button asChild variant="outline" size="sm">
                    <a href={href} download={fileName}>
                        <Download className="mr-2 h-4 w-4" /> Download
                    </a>
                </Button>
            </CardContent>
        </Card>
    );
}
