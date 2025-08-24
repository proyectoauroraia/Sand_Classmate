'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, Presentation, FileText, ClipboardCheck, MousePointerClick, Loader2, Download, RefreshCw, AlertCircle, Copy } from 'lucide-react';
import { generateMaterialsAction } from '@/lib/actions';
import type { GeneratedMaterials } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
            <Card className="flex flex-col items-center justify-center text-center p-10 h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-semibold">Generating your materials...</p>
                <p className="text-sm text-muted-foreground">This may take a few moments. Please don't close this page.</p>
            </Card>
        );
    }
    
    if(result) {
        return (
             <Card>
                <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Your materials for "{fileName}" are ready!</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        <MaterialCard icon={FileText} title="Work Guide" description="PDF document" href={result.workGuide} fileName="work-guide.pdf"/>
                        <MaterialCard icon={ClipboardCheck} title="Example Tests" description="PDF document" href={result.exampleTests} fileName="example-tests.pdf"/>
                        <MaterialCard icon={MousePointerClick} title="Interactive Review" description="Interactive PDF" href={result.interactiveReviewPdf} fileName="interactive-review.pdf"/>
                        <PresentationCard markdownContent={result.powerpointPresentation} />
                    </div>
                    <Button onClick={resetState} className="mt-6">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Generate Another
                    </Button>
                </CardContent>
             </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div 
                        className={cn(
                            "flex flex-col items-center justify-center p-10 rounded-lg cursor-pointer transition-colors bg-secondary/50 hover:bg-secondary",
                            error && "border-destructive hover:border-destructive border-2"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadCloud className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-lg font-semibold text-foreground">
                            {fileName ? fileName : 'Click or drag file to upload'}
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
                    <Button type="submit" disabled={isLoading || !fileName} size="lg">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                        Generate Materials
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function MaterialCard({ icon: Icon, title, description, href, fileName }: { icon: React.ElementType, title: string, description: string, href: string, fileName: string }) {
    return (
        <Card className="flex flex-col">
            <CardContent className="flex flex-col flex-1 items-start p-6">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-lg font-semibold">{title}</h4>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{description}</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={href} download={fileName}>
                        <Download className="mr-2 h-4 w-4" /> Download
                    </a>
                </Button>
            </CardContent>
        </Card>
    );
}

function PresentationCard({ markdownContent }: { markdownContent: string }) {
    const { toast } = useToast();
    const handleCopy = () => {
        navigator.clipboard.writeText(markdownContent);
        toast({ title: "Copied to clipboard!" });
    };

    return (
        <Card className="flex flex-col">
            <CardContent className="flex flex-col flex-1 items-start p-6">
                 <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Presentation className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-lg font-semibold">PowerPoint Content</h4>
                <p className="text-sm text-muted-foreground mb-4 flex-1">Copy the markdown content and paste it into your presentation software.</p>
                <div className="w-full space-y-2">
                    <Textarea 
                        readOnly 
                        value={markdownContent} 
                        className="h-32 text-xs bg-secondary/50" 
                    />
                    <Button onClick={handleCopy} variant="outline" size="sm" className="w-full">
                        <Copy className="mr-2 h-4 w-4" /> Copy Content
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
