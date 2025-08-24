'use server';

import { generateEducationalMaterials } from '@/ai/flows/generate-educational-materials';
import type { GeneratedMaterials } from '@/lib/types';
import { z } from 'zod';
import PptxGenJS from 'pptxgenjs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const ActionInputSchema = z.object({
  syllabusFile: z.string().refine(
    (uri) => uri.startsWith('data:application/pdf;base64,'),
    {
      message: 'Invalid file type. Only PDF documents are supported.',
    }
  ),
});

async function createPdf(title: string, content: string): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let page = pdfDoc.addPage();

  const { width, height } = page.getSize();
  const fontSize = 12;
  const margin = 50;
  const y = height - 4 * fontSize;

  page.drawText(title, {
    x: margin,
    y: height - 2 * fontSize,
    font,
    size: fontSize * 1.5,
    color: rgb(0, 0, 0),
  });

  const lines = content.split('\n');
  let currentY = y;

  for (const line of lines) {
    if (currentY < margin) {
      page = pdfDoc.addPage();
      currentY = height - margin;
    }
    page.drawText(line, { x: margin, y: currentY, font, size: fontSize });
    currentY -= fontSize * 1.5;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString('base64');
}

async function createPptx(markdownContent: string): Promise<string> {
    const pres = new PptxGenJS();
    const slidesContent = markdownContent.split('\n## ');

    slidesContent.forEach((slideContent, index) => {
        const slide = pres.addSlide();
        const [title, ...content] = slideContent.replace(/^## /, '').split('\n').filter(line => line.trim() !== '');

        slide.addText(title || `Slide ${index + 1}`, {
            x: 0.5,
            y: 0.25,
            w: '90%',
            h: 0.75,
            fontSize: 24,
            bold: true,
            color: '363636',
        });
        
        slide.addText(content.join('\n'), {
            x: 0.5,
            y: 1.1,
            w: '90%',
            h: '75%',
            fontSize: 16,
            bullet: true,
        });
    });

    const pptxBuffer = await pres.write('base64');
    return pptxBuffer as string;
}


export async function generateMaterialsAction(
  dataUri: string
): Promise<{ data: GeneratedMaterials | null; error: string | null }> {
  const validation = ActionInputSchema.safeParse({ syllabusFile: dataUri });
  if (!validation.success) {
    const error = validation.error.errors[0]?.message || 'Invalid data URI provided.';
    return { data: null, error };
  }
  
  try {
    const contentResult = await generateEducationalMaterials({
      syllabusFile: dataUri,
    });

    const [pptxBase64, workGuideBase64, exampleTestsBase64, interactiveReviewBase64] = await Promise.all([
        createPptx(contentResult.powerpointPresentation),
        createPdf('Work Guide', contentResult.workGuide),
        createPdf('Example Tests', contentResult.exampleTests),
        createPdf('Interactive Review', contentResult.interactiveReviewPdf),
    ]);

    const result: GeneratedMaterials = {
        powerpointPresentation: `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${pptxBase64}`,
        workGuide: `data:application/pdf;base64,${workGuideBase64}`,
        exampleTests: `data:application/pdf;base64,${exampleTestsBase64}`,
        interactiveReviewPdf: `data:application/pdf;base64,${interactiveReviewBase64}`,
    };
    
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error: `Failed to generate materials: ${errorMessage}` };
  }
}
