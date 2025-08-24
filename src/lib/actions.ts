
'use server';

import { analyzeAndEnrichContent, generateMaterialFromAnalysis } from '@/ai/flows/educational-content-flows';
import type { AnalysisResult } from '@/lib/types';
import { z } from 'zod';
import PptxGenJS from 'pptxgenjs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Numbering, Indent, Footer, PageNumber } from 'docx';
import type { GeneratedMaterials } from '@/lib/types';


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
});


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
  materialType: keyof GeneratedMaterials
): Promise<{ data: string | null; error: string | null }> {
    const validation = GenerateMaterialInputSchema.safeParse({ analysisResult, materialType });
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
        switch(materialType) {
            case 'powerpointPresentation':
                fileDataUri = await createStyledPptx(markdownContent);
                break;
            case 'workGuide':
                fileDataUri = await createStyledDocx('Guía de Trabajo', markdownContent);
                break;
            case 'exampleTests':
                fileDataUri = await createStyledDocx('Examen de Ejemplo', markdownContent);
                break;
            case 'interactiveReviewPdf':
                 fileDataUri = await createStyledDocx('Repaso Interactivo', markdownContent);
                break;
            default:
                throw new Error("Tipo de material no soportado");
        }
        
        return { data: fileDataUri, error: null };

    } catch(e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
        return { data: null, error: `Falló la generación del material: ${errorMessage}` };
    }
}
    
    
