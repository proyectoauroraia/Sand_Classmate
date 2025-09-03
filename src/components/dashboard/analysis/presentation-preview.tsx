
'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Parses markdown content into an array of slide objects.
 * Each slide is expected to have a title starting with '##' and content following it.
 * This is a simple parser and assumes a consistent structure.
 */
const parseMarkdownToSlides = (markdown: string): { title: string; content: string }[] => {
    if (!markdown) return [];
    // Split by '## ' which indicates a new slide title. The filter removes empty strings.
    const slideChunks = markdown.split('\n## ').filter(chunk => chunk.trim() !== '');
    
    // The first chunk might be the main presentation title (#)
    let mainTitle = '';
    let slidesStartIndex = 0;
    if (slideChunks[0] && slideChunks[0].startsWith('# ')) {
        mainTitle = slideChunks[0].replace('# ', '').split('\n')[0]?.trim() || 'Presentación';
        slidesStartIndex = 1;
    }

    const slides = slideChunks.map((chunk, index) => {
        // The first line of a chunk is the title.
        const lines = chunk.split('\n');
        const title = (index === 0 && mainTitle) ? mainTitle : lines[0]?.trim() || `Diapositiva ${index + 1}`;
        // The rest of the lines are content.
        const content = lines.slice(1).map(line => line.replace(/^\* /, '').trim()).join('\n');
        return { title, content };
    });

    // If the first slide was a title slide, and there are other slides, use the content from the first real slide chunk.
    if (mainTitle && slides.length > 0 && slideChunks[0].includes('\n')) {
       const contentLines = slideChunks[0].split('\n').slice(1);
       slides[0] = { title: mainTitle, content: contentLines.join('\n').replace(/^\* /, '').trim() }
    } else if (mainTitle && slides.length === 0 && slideChunks.length > 0) {
        // Handle case where there's only a title slide
        const contentLines = slideChunks[0].split('\n').slice(1);
        return [{ title: mainTitle, content: contentLines.join('\n').replace(/^\* /, '').trim() }]
    }


    return slides;
};


/**
 * Converts an array of slide objects back into a markdown string.
 */
const stringifySlidesToMarkdown = (slides: { title: string; content: string }[]): string => {
    return slides.map((slide, index) => {
        // The first slide uses a single # for the main title
        const titlePrefix = index === 0 ? '# ' : '## ';
        const title = `${titlePrefix}${slide.title}`;
        const content = slide.content.split('\n').map(line => `* ${line}`).join('\n');
        return `${title}\n${content}`;
    }).join('\n\n');
};

interface PresentationPreviewProps {
    initialMarkdown: string;
    onClose: () => void;
    onDownload: (finalMarkdown: string) => void;
    isLoading: boolean;
}

export function PresentationPreview({ initialMarkdown, onClose, onDownload, isLoading }: PresentationPreviewProps) {
    const [slides, setSlides] = React.useState<{ title: string; content: string }[]>([]);

    // When the component mounts, parse the initial markdown into slides.
    React.useEffect(() => {
        setSlides(parseMarkdownToSlides(initialMarkdown));
    }, [initialMarkdown]);

    // Handle changes to a slide's title or content.
    const handleSlideChange = (index: number, field: 'title' | 'content', value: string) => {
        const updatedSlides = [...slides];
        updatedSlides[index] = { ...updatedSlides[index], [field]: value };
        setSlides(updatedSlides);
    };

    const handleDownloadClick = () => {
        const finalMarkdown = stringifySlidesToMarkdown(slides);
        onDownload(finalMarkdown);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl">Editar Contenido de la Presentación</DialogTitle>
                    <DialogDescription>
                        Revisa y ajusta el texto de cada diapositiva. Los cambios se guardarán para la descarga final.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-hidden px-6">
                    <ScrollArea className="h-full pr-4">
                        <div className="space-y-4">
                            {slides.map((slide, index) => (
                                <Card key={index} className="bg-secondary/20">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Diapositiva {index + 1}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Título</label>
                                            <Input
                                                value={slide.title}
                                                onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                                                className="mt-1 text-base font-semibold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Contenido (un punto por línea)</label>
                                            <Textarea
                                                value={slide.content}
                                                onChange={(e) => handleSlideChange(index, 'content', e.target.value)}
                                                className="mt-1"
                                                rows={5}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <DialogFooter className="p-6 bg-muted border-t">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleDownloadClick} disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        {isLoading ? 'Generando...' : 'Generar y Descargar PPTX'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
