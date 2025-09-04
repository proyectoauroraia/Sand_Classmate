
'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Download, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';


const themes = {
    sand: { name: "Duna", colors: { bg: "FDFBF6", title: "5A3D2B", text: "3C2A1E", accent: "C0A080" } },
    ocean: { name: "Océano", colors: { bg: "F0F7FA", title: "003366", text: "005A9C", accent: "66CCFF" } },
    forest: { name: "Bosque", colors: { bg: "F3F7F2", title: "2F4F2F", text: "4A704A", accent: "90B090" } },
    sunrise: { name: "Amanecer", colors: { bg: "FFF8F0", title: "E67E22", text: "D35400", accent: "F39C12" } },
    dusk: { name: "Nocturno", colors: { bg: "2C3E50", title: "ECF0F1", text: "BDC3C7", accent: "3498DB" } },
};
type ThemeKey = keyof typeof themes;

/**
 * Parses markdown content into an array of slide objects.
 */
const parseMarkdownToSlides = (markdown: string): { title: string; content: string }[] => {
    if (!markdown) return [];
    const slideChunks = markdown.split('\n## ').filter(chunk => chunk.trim() !== '');
    let mainTitle = 'Presentación';

    if (slideChunks[0] && slideChunks[0].startsWith('# ')) {
        const titleLine = slideChunks[0].split('\n')[0];
        mainTitle = titleLine.replace('# ', '').trim();
    }
    
    return slideChunks.map((chunk, index) => {
        const lines = chunk.split('\n');
        let title: string;
        let contentLines: string[];

        if (index === 0 && chunk.startsWith('# ')) {
            title = mainTitle;
            contentLines = lines.slice(1);
        } else {
            title = lines[0]?.trim() || `Diapositiva ${index + 1}`;
            contentLines = lines.slice(1);
        }
        
        const content = contentLines.map(line => line.replace(/^\* /, '').trim()).join('\n');
        return { title, content };
    });
};


/**
 * Converts an array of slide objects back into a markdown string.
 */
const stringifySlidesToMarkdown = (slides: { title: string; content: string }[]): string => {
    return slides.map((slide, index) => {
        const titlePrefix = index === 0 ? '# ' : '## ';
        const title = `${titlePrefix}${slide.title}`;
        const content = slide.content.split('\n').filter(l => l.trim() !== '').map(line => `* ${line}`).join('\n');
        return `${title}\n${content}`;
    }).join('\n\n');
};

interface PresentationPreviewProps {
    initialMarkdown: string;
    onClose: () => void;
    onDownload: (finalMarkdown: string, theme: string) => void;
    isLoading: boolean;
}

export function PresentationPreview({ initialMarkdown, onClose, onDownload, isLoading }: PresentationPreviewProps) {
    const [slides, setSlides] = React.useState<{ title: string; content: string }[]>([]);
    const [selectedTheme, setSelectedTheme] = React.useState<ThemeKey>('sand');

    React.useEffect(() => {
        setSlides(parseMarkdownToSlides(initialMarkdown));
    }, [initialMarkdown]);

    const handleSlideChange = (index: number, field: 'title' | 'content', value: string) => {
        const updatedSlides = [...slides];
        updatedSlides[index] = { ...updatedSlides[index], [field]: value };
        setSlides(updatedSlides);
    };

    const handleDownloadClick = () => {
        const finalMarkdown = stringifySlidesToMarkdown(slides);
        onDownload(finalMarkdown, selectedTheme);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle className="text-2xl">Editar y Diseñar Presentación</DialogTitle>
                    <DialogDescription>
                        Ajusta el texto de cada diapositiva y elige un tema visual para la descarga final.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 overflow-hidden">
                    {/* Editor Panel */}
                    <div className="md:col-span-2 flex flex-col overflow-hidden">
                         <div className="flex-grow overflow-hidden px-6 py-4">
                            <ScrollArea className="h-full pr-4">
                                <div className="space-y-4">
                                    {slides.map((slide, index) => (
                                        <Card key={index} className="bg-secondary/20">
                                            <CardHeader>
                                                <CardTitle className="text-base">Diapositiva {index + 1}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div>
                                                    <label className="text-xs font-medium text-muted-foreground">Título</label>
                                                    <Input
                                                        value={slide.title}
                                                        onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                                                        className="mt-1 text-sm font-semibold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-muted-foreground">Contenido (un punto por línea)</label>
                                                    <Textarea
                                                        value={slide.content}
                                                        onChange={(e) => handleSlideChange(index, 'content', e.target.value)}
                                                        className="mt-1 text-sm"
                                                        rows={5}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                    {/* Theme Panel */}
                    <div className="md:col-span-1 bg-muted/50 p-6 border-l flex flex-col">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Elige un Tema</h3>
                        <div className="space-y-3">
                            {Object.entries(themes).map(([key, theme]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedTheme(key as ThemeKey)}
                                    className={cn(
                                        "w-full p-3 rounded-lg border-2 transition-all flex items-center justify-between text-left",
                                        selectedTheme === key ? 'border-primary bg-primary/10' : 'border-transparent bg-background hover:border-primary/50'
                                    )}
                                >
                                    <span className={cn("font-semibold", selectedTheme === key ? 'text-primary' : 'text-foreground')}>{theme.name}</span>
                                    <div className="flex gap-1">
                                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: `#${theme.colors.bg}` }}></div>
                                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: `#${theme.colors.title}` }}></div>
                                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: `#${theme.colors.text}` }}></div>
                                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: `#${theme.colors.accent}` }}></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                         <div className="mt-auto flex flex-col gap-2">
                             <Button onClick={onClose} variant="outline" disabled={isLoading}>
                                Cancelar
                            </Button>
                            <Button onClick={handleDownloadClick} disabled={isLoading} size="lg">
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Download className="mr-2 h-5 w-5" />
                                )}
                                {isLoading ? 'Generando...' : 'Generar y Descargar PPTX'}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
