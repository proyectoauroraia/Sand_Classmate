
'use server';

import { analyzeAndEnrichContent, generateMaterialFromAnalysis } from '@/ai/flows/educational-content-flows';
import type { AnalysisResult } from '@/lib/types';
import { z } from 'zod';
import PptxGenJS from 'pptxgenjs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Numbering, Indent, Footer, PageNumber } from 'docx';
import type { GeneratedMaterials } from '@/lib/types';
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';


const AnalyzeInputSchema = z.object({
  documentDataUri: z.string().refine(
    (uri) => uri.startsWith('data:application/pdf;base64,'),
    'Solo se admiten documentos PDF.'
  ),
});

const GenerateMaterialInputSchema = z.object({
    analysisResult: z.object({
        summary: z.string().optional(),
        keyConcepts: z.array(z.string()).optional(),
        subjectArea: z.string(),
        weeks: z.union([z.number(), z.string()]).optional(),
        courseStructure: z.array(z.object({
          title: z.string(),
          learningObjectives: z.array(z.string()),
        })).optional(),
        assessments: z.array(z.object({
          type: z.string(),
          description: z.string(),
        })).optional(),
        bibliography: z.any().optional(),
        enrichedContent: z.any().optional(),
    }),
    materialType: z.enum(['powerpointPresentation', 'workGuide', 'exampleTests', 'interactiveReviewPdf']),
    format: z.enum(['docx', 'pdf']),
});


async function createStyledPdf(title: string, markdownContent: string): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const margin = 50;
    let y = height - margin;

    const drawText = (text: string, x: number, currentY: number, font: any, size: number, color = rgb(0, 0, 0)) => {
        page.drawText(text, { x, y: currentY, font, size, color });
        return size + 4; // Line height
    };
    
    const wrapText = (text: string, maxWidth: number, font: any, size: number): string[] => {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        for(const word of words){
            const testLine = currentLine.length > 0 ? `${currentLine} ${word}` : word;
            const testWidth = font.widthOfTextAtSize(testLine, size);
            if(testWidth > maxWidth){
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
        return lines;
    };


    y -= drawText(title, margin, y, fontBold, 24);
    y -= 20;

    const lines = markdownContent.split('\n');

    for (const line of lines) {
        if (y < margin) {
            const newPage = pdfDoc.addPage(PageSizes.A4);
            page.setRotation(newPage.getRotation());
            y = height - margin;
        }

        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('## ')) {
            y -= 20;
            const wrappedLines = wrapText(trimmedLine.substring(3), width - 2 * margin, fontBold, 16);
            for(const wrapped of wrappedLines){
                y -= drawText(wrapped, margin, y, fontBold, 16);
            }
            y -= 10;
        } else if (trimmedLine.startsWith('### ')) {
             y -= 15;
            const wrappedLines = wrapText(trimmedLine.substring(4), width - 2 * margin, fontBold, 14);
            for(const wrapped of wrappedLines){
                y -= drawText(wrapped, margin, y, fontBold, 14);
            }
            y -= 8;
        } else if (trimmedLine.startsWith('* ')) {
            const itemText = trimmedLine.substring(2);
            const wrappedLines = wrapText(itemText, width - 2 * margin - 20, font, 12);
            for(const [i, wrapped] of wrappedLines.entries()){
                const bullet = i === 0 ? '• ' : '  ';
                y -= drawText(bullet + wrapped, margin + 10, y, font, 12);
            }
        } else if (trimmedLine.length > 0) {
            const wrappedLines = wrapText(trimmedLine, width - 2 * margin, font, 12);
            for(const wrapped of wrappedLines){
                y -= drawText(wrapped, margin, y, font, 12);
            }
        } else {
            y -= 12; // Empty line
        }
    }
    
     // Footer
    const pages = pdfDoc.getPages();
    for (let i = 0; i < pages.length; i++) {
        pages[i].drawText(`Generado por Sand Classmate - Página ${i + 1} de ${pages.length}`, {
            x: margin,
            y: margin / 2,
            size: 8,
            font: font,
            color: rgb(0.5, 0.5, 0.5),
        });
    }

    const pdfBytes = await pdfDoc.save();
    return `data:application/pdf;base64,${Buffer.from(pdfBytes).toString('base64')}`;
}


async function createStyledDocx(title: string, markdownContent: string): Promise<string> {
    const doc = new Document({
        creator: "Sand Classmate",
        title: title,
        description: `Material de curso sobre ${title}`,
        styles: {
            paragraphStyles: [
                {
                    id: "Heading1",
                    name: "Heading 1",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        size: 56, // 28pt
                        bold: true,
                        color: "5A3D2B",
                    },
                    paragraph: {
                        spacing: { after: 240 },
                    },
                },
                {
                    id: "Heading2",
                    name: "Heading 2",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        size: 36, // 18pt
                        bold: true,
                        color: "3C2A1E",
                    },
                    paragraph: {
                        spacing: { before: 240, after: 120 },
                    },
                },
                 {
                    id: "Heading3",
                    name: "Heading 3",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        size: 28, // 14pt
                        bold: true,
                        color: "3C2A1E",
                    },
                    paragraph: {
                        spacing: { before: 120, after: 80 },
                    },
                },
            ],
        },
        numbering: {
            config: [
                {
                    reference: "bullet-points",
                    levels: [
                        {
                            level: 0,
                            format: "bullet",
                            text: "•",
                            alignment: AlignmentType.LEFT,
                            style: {
                                paragraph: {
                                    indent: { left: 720, hanging: 360 },
                                },
                            },
                        },
                    ],
                },
            ],
        },
    });

    const children = [new Paragraph({
        heading: HeadingLevel.HEADING_1,
        text: title,
        alignment: AlignmentType.CENTER,
    })];

    const lines = markdownContent.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('## ')) {
             children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: trimmedLine.substring(3) }));
        } else if (trimmedLine.startsWith('### ')) {
            children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, text: trimmedLine.substring(4) }));
        } else if (trimmedLine.startsWith('* ')) {
            children.push(new Paragraph({
                text: trimmedLine.substring(2),
                numbering: {
                    reference: "bullet-points",
                    level: 0,
                },
                style: {
                    paragraph: {
                        indent: { left: 720, hanging: 360 }
                    }
                }
            }));
        } else if (trimmedLine.length > 0) {
            children.push(new Paragraph({ text: trimmedLine }));
        } else {
             children.push(new Paragraph("")); // Empty line for spacing
        }
    }


    doc.addSection({
        footers: {
            default: new Footer({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                children: ["Generado por Sand Classmate - Página ", PageNumber.CURRENT],
                                size: 18, // 9pt
                            }),
                        ],
                    }),
                ],
            }),
        },
        children,
    });

    const buffer = await Packer.toBuffer(doc);
    return `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${buffer.toString('base64')}`;
}


async function createStyledPptx(markdownContent: string): Promise<string> {
    const pres = new PptxGenJS();
    pres.layout = 'LAYOUT_16x9';

    // Master Slide with a warm, sandy background and professional footer
    pres.defineSlideMaster({
        title: 'MASTER_SLIDE',
        background: { color: 'FDFBF6' }, // Light sand color
        objects: [
            { 'rect': { x: 0, y: '93%', w: '100%', h: 0.25, fill: { color: 'C0A080' } } }, // Muted terracotta/sand color
            { 'text': {
                text: 'Generado por Sand Classmate',
                options: { x: 0, y: '95%', w: '100%', align: 'center', color: '6B4F3A', fontSize: 10 }
            }}
        ],
    });

    const slidesContent = markdownContent.split('\n## ');
    
    const titleText = slidesContent[0]?.replace('# ', '').trim() || 'Presentación';
    // Title Slide
    const titleSlide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    titleSlide.addText(titleText, {
        x: 0.5, y: 1.5, w: 9, h: 1.5, fontSize: 48, bold: true, align: 'center', color: '5A3D2B' // Dark brown/terracotta
    });
     titleSlide.addText('Material de curso generado por Sand Classmate', {
        x: 0.5, y: 2.8, w: 9, h: 1, fontSize: 20, align: 'center', color: '6B4F3A' // Muted brown
    });

    if (slidesContent.length > 1) {
        // Content slides
        slidesContent.slice(1).forEach((slideContent) => {
            const slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
            const [title, ...contentPoints] = slideContent.split('\n').map(l => l.trim()).filter(line => line);

            slide.addText(title.replace('## ', ''), {
                x: 0.5, y: 0.25, w: '90%', h: 0.75, fontSize: 32, bold: true, color: '5A3D2B',
            });
            
            const content = contentPoints.map(point => point.replace(/^\* /, '').trim());

            if (content.length > 0) {
                slide.addText(content.join('\n'), {
                    x: 0.75, y: 1.5, w: '85%', h: 3.75, fontSize: 20, color: '3C2A1E', bullet: true,
                });
            }
        });
    }

    const pptxBase64 = await pres.write('base64');
    return `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${pptxBase64}`;
}


export async function analyzeContentAction(
  documentDataUri: string
): Promise<{ data: AnalysisResult | null; error: string | null }> {
  const validation = AnalyzeInputSchema.safeParse({ documentDataUri });
  if (!validation.success) {
    const error = validation.error.errors[0]?.message || 'Datos de entrada inválidos.';
    return { data: null, error };
  }
  
  try {
    const analysisResult = await analyzeAndEnrichContent({
      documentDataUri,
    });
    
    return { data: analysisResult, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
    return { data: null, error: `Falló el análisis del contenido: ${errorMessage}` };
  }
}

export async function generateMaterialsActionFromAnalysis(
  analysisResult: AnalysisResult,
  materialType: keyof GeneratedMaterials,
  format: 'docx' | 'pdf'
): Promise<{ data: string | null; error: string | null }> {
    const validation = GenerateMaterialInputSchema.safeParse({ analysisResult, materialType, format });
    if (!validation.success) {
        const error = validation.error.errors[0]?.message || 'Datos de entrada inválidos para la generación.';
        return { data: null, error };
    }

    try {
        const markdownContent = await generateMaterialFromAnalysis({
            analysisResult,
            materialType,
        });

        if (!markdownContent) {
            throw new Error('Sand Classmate no pudo generar contenido para este material. Por favor, inténtalo de nuevo o con un documento diferente.');
        }

        let fileDataUri: string;
        
        if (materialType === 'powerpointPresentation') {
            fileDataUri = await createStyledPptx(markdownContent);
        } else if (format === 'docx') {
             const titleMap = {
                workGuide: 'Guía de Trabajo',
                exampleTests: 'Examen de Ejemplo',
                interactiveReviewPdf: 'Repaso Interactivo'
            };
            fileDataUri = await createStyledDocx(titleMap[materialType], markdownContent);
        } else { // pdf
            const titleMap = {
                workGuide: 'Guía de Trabajo',
                exampleTests: 'Examen de Ejemplo',
                interactiveReviewPdf: 'Repaso Interactivo'
            };
            fileDataUri = await createStyledPdf(titleMap[materialType], markdownContent);
        }
        
        return { data: fileDataUri, error: null };

    } catch(e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
        return { data: null, error: `Falló la generación del material: ${errorMessage}` };
    }
}
    
    
