
'use server';

import { analyzeAndEnrichContent, generateMaterialFromAnalysis } from '@/ai/flows/educational-content-flows';
import type { AnalysisResult } from '@/lib/types';
import { z } from 'zod';
import PptxGenJS from 'pptxgenjs';
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';
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


async function createStyledPdf(title: string, markdownContent: string): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const primaryColor = rgb(0.333, 0.22, 0.133); // Terracotta
    const textColor = rgb(0.15, 0.15, 0.15); // Almost Black
    const grayColor = rgb(0.5, 0.5, 0.5);

    const margin = 50;
    let y = height - margin;

    const addNewPage = () => {
        page = pdfDoc.addPage(PageSizes.A4);
        y = height - margin;
        // Footer on new page
        page.drawText(`Generado por Sand Classmate - ${new Date().toLocaleDateString()}`, {
            x: margin,
            y: margin / 2,
            font: helveticaFont,
            size: 9,
            color: grayColor,
        });
    };
    
    // Initial Footer
    page.drawText(`Generado por Sand Classmate - ${new Date().toLocaleDateString()}`, {
        x: margin, y: margin/2, font: helveticaFont, size: 9, color: grayColor
    });


    // Main Title
    page.drawText(title, {
        x: margin, y, font: helveticaBoldFont, size: 28, color: primaryColor,
    });
    y -= 50;

    const lines = markdownContent.split('\n');

    for (const line of lines) {
        if (y < margin + 20) { // Check for space before writing new line
            addNewPage();
        }

        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('## ')) {
            y -= 10; // Extra space before H2
            page.drawText(trimmedLine.substring(3), { x: margin, y, font: helveticaBoldFont, size: 18, color: textColor });
            y -= 25;
        } else if (trimmedLine.startsWith('### ')) {
            y -= 5; // Extra space before H3
            page.drawText(trimmedLine.substring(4), { x: margin, y, font: helveticaBoldFont, size: 14, color: textColor });
            y -= 20;
        } else if (trimmedLine.startsWith('* ')) {
            // Basic wrapping for long bullet points
            const text = `•  ${trimmedLine.substring(2)}`;
            const textWidth = helveticaFont.widthOfTextAtSize(text, 11);
            const maxWidth = width - margin * 2 - 15;
            if (textWidth > maxWidth) {
                 const words = text.split(' ');
                 let currentLine = '';
                 for (const word of words) {
                    const testLine = currentLine + word + ' ';
                    if(helveticaFont.widthOfTextAtSize(testLine, 11) > maxWidth) {
                         page.drawText(currentLine, { x: margin + 15, y, font: helveticaFont, size: 11, color: textColor, lineHeight: 15 });
                         y -= 18;
                         currentLine = word + ' ';
                    } else {
                        currentLine = testLine;
                    }
                 }
                 page.drawText(currentLine, { x: margin + 15, y, font: helveticaFont, size: 11, color: textColor, lineHeight: 15 });
                 y-= 18;

            } else {
                 page.drawText(text, { x: margin + 15, y, font: helveticaFont, size: 11, color: textColor });
                 y -= 18;
            }
        } else if (trimmedLine.length > 0) {
             page.drawText(trimmedLine, { x: margin, y, font: helveticaFont, size: 11, color: textColor, lineHeight: 15 });
             y -= 18;
        } else {
            y -= 10;
        }
    }

    const pdfBytes = await pdfDoc.save();
    return `data:application/pdf;base64,${Buffer.from(pdfBytes).toString('base64')}`;
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
                fileDataUri = await createStyledPdf('Guía de Trabajo', markdownContent);
                break;
            case 'exampleTests':
                fileDataUri = await createStyledPdf('Examen de Ejemplo', markdownContent);
                break;
            case 'interactiveReviewPdf':
                 fileDataUri = await createStyledPdf('Repaso Interactivo', markdownContent);
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
    
    
