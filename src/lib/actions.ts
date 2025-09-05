
'use server';

import { analyzeAndEnrichContent } from '@/ai/flows/analyze';
import { generateMaterialFromAnalysis } from '@/ai/flows/generate';
import type { AnalysisResult, CheckoutSessionResult, WebpayCommitResult, UserProfile, GeneratedMaterials } from '@/lib/types';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { generateFileHash } from '@/lib/utils';
import { subDays } from 'date-fns';


export async function startAnalysisAction({ fileKey }: { fileKey: string }): Promise<{ analysisId: string | null, error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { analysisId: null, error: 'Unauthorized' };
  }

  // 1) Verifica cuota (RPC/servidor) - Asumiendo que esta función existe en la DB
  const { data: canUse, error: rpcError } = await supabase.rpc('can_consume_analysis', {});
  if (rpcError) {
      console.error('RPC can_consume_analysis error:', rpcError);
      return { analysisId: null, error: 'No se pudo verificar tu cuota de uso.' };
  }
  if (!canUse) {
    return { analysisId: null, error: 'Has alcanzado tu límite diario de análisis. Mejora tu plan para analizar más documentos.' };
  }

  // 2) Crea analysis
  const { data: analysis, error: insErr } = await supabase
    .from('analyses')
    .insert({ owner_id: user.id, file_key: fileKey, status: 'queued' })
    .select('id')
    .single();

  if (insErr) {
    console.error('Insert analysis error:', insErr);
    return { analysisId: null, error: 'No se pudo iniciar el proceso de análisis.' };
  }

  // No esperamos a que termine, solo iniciamos. El cliente deberá consultar el estado.
  // En un entorno real, esto se ejecutaría en un worker separado (e.g., Supabase Edge Function).
  // Por ahora, lo ejecutamos de forma asíncrona sin esperar el resultado.
  (async () => {
    try {
      await supabase.from('analyses').update({ status: 'processing' }).eq('id', analysis.id);

      const result = await analyzeAndEnrichContent({ fileKey });

      await supabase.from('analyses').update({
        status: 'done',
        summary: result.summary,
        key_concepts: result.keyConcepts,
        course_structure: result.courseStructure,
        assessments: result.assessments,
        bibliography: result.bibliography,
        links_of_interest: result.linksOfInterest,
        review_videos: result.reviewVideos,
        active_methodologies: result.activeMethodologies,
        tokens: result.tokens,
        prompt_version: result.promptVersion,
      }).eq('id', analysis.id);

      // 3) incrementa contador - Asumiendo que esta función existe en la DB
      await supabase.rpc('increment_analyses', {});
    } catch (e) {
      console.error('Background analysis error:', e);
      await supabase.from('analyses').update({ status: 'error' }).eq('id', analysis.id);
    }
  })();
  
  revalidatePath('/dashboard/history');
  return { analysisId: analysis.id, error: null };
}


// The old action is kept for reference but is no longer used by the file uploader.
export async function analyzeContentAction(
  documentDataUri: string
): Promise<{ data: AnalysisResult | null; error: string | null }> {
    return { data: null, error: "This action is deprecated. Use startAnalysisAction instead."};
}


export async function generateMaterialsActionFromAnalysis(
  analysisResult: AnalysisResult,
  materialType: keyof GeneratedMaterials | 'powerpointPresentation',
  format: 'docx' | 'pdf' | 'pptx',
  classContext?: { unitTitle: string; classTopic: string }
): Promise<{ data: string | null; error: string | null }> {
    const validation = z.object({
        analysisResult: z.any(),
        materialType: z.enum(['powerpointPresentation', 'workGuide', 'exampleTests', 'interactiveReviewPdf']),
        format: z.enum(['docx', 'pdf', 'pptx']),
        classContext: z.object({
            unitTitle: z.string(),
            classTopic: z.string(),
        }).optional(),
    }).safeParse({ analysisResult, materialType, format, classContext });

    if (!validation.success) {
        const error = validation.error.errors[0]?.message || 'Datos de entrada inválidos para la generación.';
        console.error("Generate Material Validation Error:", validation.error.format());
        return { data: null, error };
    }

    try {
        const markdownContent = await generateMaterialFromAnalysis({
            analysisResult,
            materialType,
            classContext,
        });

        if (!markdownContent) {
            throw new Error('Sand Classmate no pudo generar contenido para este material. Por favor, inténtalo de nuevo o con un documento diferente.');
        }

        if (materialType === 'powerpointPresentation') {
            return { data: markdownContent, error: null };
        }

        let fileDataUri: string;
        
        const titleMap = {
            workGuide: 'Guía de Trabajo',
            exampleTests: 'Examen de Ejemplo',
            interactiveReviewPdf: 'Repaso Interactivo',
        };
        const title = titleMap[materialType as keyof typeof titleMap];

        if (format === 'docx') {
            fileDataUri = await createStyledDocx(title, markdownContent);
        } else { // pdf
            fileDataUri = await createStyledPdf(title, markdownContent);
        }
        
        return { data: fileDataUri, error: null };

    } catch(e) {
        console.error("Generate Material Error:", e);
        const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
         if (errorMessage.includes('503')) {
            return { data: null, error: 'El servicio de IA está temporalmente sobrecargado. Por favor, inténtalo de nuevo en unos momentos.' };
        }
        return { data: null, error: `Falló la generación del material: ${errorMessage}` };
    }
}

async function createStyledPdf(title: string, markdownContent: string): Promise<string> {
    const { PDFDocument, rgb, StandardFonts, PageSizes } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const margin = 50;
    let y = height - margin;

    const checkY = (requiredHeight: number) => {
        if (y - requiredHeight < margin) {
            page = pdfDoc.addPage(PageSizes.A4);
            y = height - margin;
        }
    };

    const drawText = (text: string, x: number, currentY: number, font: any, size: number, color = rgb(0.1, 0.1, 0.1)) => {
        page.drawText(text, { x, y: currentY, font, size, color, lineHeight: size * 1.2 });
        return size * 1.2;
    };
    
    const wrapText = (text: string, maxWidth: number, font: any, size: number): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
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

    // Main Title
    checkY(30);
    y -= drawText(title, margin, y, fontBold, 24, rgb(0.15, 0.36, 0.38));
    y -= 15;

    const lines = markdownContent.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('# ')) continue; // Skip main title again

        if (trimmedLine.startsWith('## ')) {
            y -= 20;
            checkY(18);
            const wrappedLines = wrapText(trimmedLine.substring(3), width - 2 * margin, fontBold, 18);
            for(const wrapped of wrappedLines){
                y -= drawText(wrapped, margin, y, fontBold, 18, rgb(0.15, 0.36, 0.38));
            }
        } else if (trimmedLine.startsWith('### ')) {
            y -= 15;
            checkY(14);
            const wrappedLines = wrapText(trimmedLine.substring(4), width - 2 * margin, fontBold, 14);
             for(const wrapped of wrappedLines){
                y -= drawText(wrapped, margin, y, fontBold, 14, rgb(0.2, 0.2, 0.2));
            }
        } else if (trimmedLine.startsWith('* ')) {
            checkY(12);
            const itemText = trimmedLine.substring(2);
            const wrappedLines = wrapText(itemText, width - 2 * margin - 20, font, 12);
            for(const [i, wrapped] of wrappedLines.entries()){
                const bullet = i === 0 ? '• ' : '  ';
                 checkY(12);
                y -= drawText(bullet + wrapped, margin + 10, y, font, 12);
            }
        } else if (trimmedLine.match(/^\s*Pauta de Corrección:|Respuesta Ideal:/i)) {
             y -= 10;
             checkY(11);
             const answerText = trimmedLine.substring(trimmedLine.indexOf(':') + 1).trim();
             const wrappedLines = wrapText(answerText, width - 2 * margin - 20, fontItalic, 11);
              for(const wrapped of wrappedLines){
                checkY(11);
                y -= drawText(wrapped, margin + 10, y, fontItalic, 11, rgb(0.3, 0.3, 0.3));
            }

        } else if (trimmedLine.length > 0) {
            checkY(12);
            const wrappedLines = wrapText(trimmedLine, width - 2 * margin, font, 12);
            for(const wrapped of wrappedLines){
                 checkY(12);
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
    const { Document, Packer, Paragraph, HeadingLevel, AlignmentType } = await import('docx');
    
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
                    run: { size: 48, bold: true, color: "1E40AF" }, // Blue-700
                    paragraph: { spacing: { after: 240, before: 120 }, alignment: AlignmentType.CENTER },
                },
                {
                    id: "Heading2",
                    name: "Heading 2",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: { size: 36, bold: true, color: "111827" }, // Gray-900
                    paragraph: { spacing: { before: 240, after: 120 } },
                },
                 {
                    id: "Heading3",
                    name: "Heading 3",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: { size: 28, bold: true, color: "374151" }, // Gray-700
                    paragraph: { spacing: { before: 180, after: 80 } },
                },
                {
                    id: "IdealAnswer",
                    name: "Ideal Answer",
                    basedOn: "Normal",
                    run: { size: 22, italics: true, color: "4B5563"}, // Gray-600
                    paragraph: { indent: { left: 720 }, spacing: { before: 60, after: 120 } }
                }
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
                            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
                        },
                    ],
                },
            ],
        },
    });

    const children = [new Paragraph({ heading: HeadingLevel.HEADING_1, text: title })];

    const lines = markdownContent.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();
         if (trimmedLine.startsWith('# ')) continue;
        if (trimmedLine.startsWith('## ')) {
             children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: trimmedLine.substring(3) }));
        } else if (trimmedLine.startsWith('### ')) {
            children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, text: trimmedLine.substring(4) }));
        } else if (trimmedLine.startsWith('* ')) {
            children.push(new Paragraph({
                text: trimmedLine.substring(2),
                numbering: { reference: "bullet-points", level: 0 },
            }));
        } else if (trimmedLine.match(/^\s*Pauta de Corrección:|Respuesta Ideal:/i)) {
            const answerText = trimmedLine.substring(trimmedLine.indexOf(':') + 1).trim();
            children.push(new Paragraph({ text: answerText, style: "IdealAnswer" }));
        } else if (trimmedLine.length > 0) {
            children.push(new Paragraph({ text: trimmedLine }));
        } else {
             children.push(new Paragraph("")); // Empty line for spacing
        }
    }


    doc.addSection({
        children,
    });

    const buffer = await Packer.toBuffer(doc);
    return `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${buffer.toString('base64')}`;
}


const themes = {
    sand: { bg: "FDFBF6", title: "5A3D2B", text: "3C2A1E", accent: "C0A080" },
    ocean: { bg: "F0F7FA", title: "003366", text: "005A9C", accent: "66CCFF" },
    forest: { bg: "F3F7F2", title: "2F4F2F", text: "4A704A", accent: "90B090" },
    sunrise: { bg: "FFF8F0", title: "E67E22", text: "D35400", accent: "F39C12" },
    dusk: { bg: "2C3E50", title: "ECF0F1", text: "BDC3C7", accent: "3498DB" },
};
type ThemeKey = keyof typeof themes;

async function createStyledPptx(markdownContent: string, themeKey: ThemeKey, userName?: string): Promise<string> {
    const PptxGenJS = (await import('pptxgenjs')).default;
    const pres = new PptxGenJS();
    pres.layout = 'LAYOUT_16x9';

    const theme = themes[themeKey] || themes.sand;

    // Master Slide with dynamic theme colors
    pres.defineSlideMaster({
        title: 'MASTER_SLIDE',
        background: { color: theme.bg },
        objects: [
            { 'rect': { x: 0, y: '93%', w: '100%', h: 0.25, fill: { color: theme.accent } } },
            { 'text': {
                text: 'Generado por Sand Classmate',
                options: { x: 0, y: '95%', w: '100%', align: 'center', color: theme.text, fontSize: 10 }
            }}
        ],
    });

    const slidesContent = markdownContent.split('\n## ').filter(Boolean);
    
    let titleText = 'Presentación';
    
    // Handle the main title from the first slide's H1
    if (slidesContent[0] && slidesContent[0].startsWith('# ')) {
        const firstSlideParts = slidesContent[0].split('\n');
        titleText = firstSlideParts[0].replace('# ', '').trim();
        slidesContent[0] = firstSlideParts.slice(1).join('\n');
    }

    // Title Slide
    const titleSlide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    titleSlide.addText(titleText, {
        x: 0.5, y: 1.5, w: 9, h: 1.5, fontSize: 48, bold: true, align: 'center', color: theme.title
    });
    
    let subtitleY = 2.8;
    if (userName) {
        titleSlide.addText(`Docente: ${userName}`, {
            x: 0.5, y: subtitleY, w: 9, h: 0.5, fontSize: 20, align: 'center', color: theme.text, italic: true
        });
        subtitleY += 0.5;
    }

    titleSlide.addText('Material de curso generado por Sand Classmate', {
        x: 0.5, y: subtitleY, w: 9, h: 1, fontSize: 16, align: 'center', color: theme.text
    });

    // Content slides
    slidesContent.forEach((slideContent) => {
        const slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
        const lines = slideContent.split('\n').map(l => l.trim()).filter(Boolean);
        
        // Find title, which could be the first line or might not exist
        const titleLineIndex = lines.findIndex(l => !l.startsWith('*'));
        const title = titleLineIndex !== -1 ? lines[titleLineIndex].replace(/^##\s*/, '') : '';
        
        const contentPoints = lines.filter(l => l.startsWith('*')).map(point => ({
            text: point.replace(/^\* /, '').trim()
        }));

        slide.addText(title, {
            x: 0.5, y: 0.25, w: '90%', h: 0.75, fontSize: 32, bold: true, color: theme.title,
        });
        
        if (contentPoints.length > 0) {
            slide.addText(contentPoints, {
                x: 0.75, y: 1.5, w: '85%', h: 3.75, fontSize: 20, color: theme.text, bullet: true,
            });
        }
    });

    const pptxBase64 = await pres.write('base64');
    return `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${pptxBase64}`;
}


export async function createPptxAction(
    markdownContent: string,
    theme: string
): Promise<{ data: string | null; error: string | null }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        let userName: string | undefined;

        if(user) {
            const { data: profile } = await supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single();
            if(profile) {
                 userName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
            }
        }

        if (!markdownContent || typeof markdownContent !== 'string') {
            throw new Error('Contenido de la presentación no es válido.');
        }
        const fileDataUri = await createStyledPptx(markdownContent, theme as ThemeKey, userName);
        return { data: fileDataUri, error: null };

    } catch(e) {
        console.error("Create PPTX Error:", e);
        const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
        return { data: null, error: `Falló la creación del PPTX: ${errorMessage}` };
    }
}


export async function updateUserProfileAction(
  formData: FormData
): Promise<{ data: UserProfile | null; error: string | null }> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'No estás autenticado.' };
    }

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const institutionsStr = formData.get('institutions') as string;
    let institutions: string[] = [];

    try {
        institutions = JSON.parse(institutionsStr);
    } catch(e) {
        return { data: null, error: 'Formato de instituciones inválido.' };
    }

    if (!firstName || firstName.trim().length === 0) {
        return { data: null, error: 'El nombre es requerido.'};
    }
    
    const profileImageFile = formData.get('profileImage') as File | null;
    let avatarUrl: string | undefined = undefined;

    // This object is for updating the 'profiles' table.
    const profileDataToUpdate: {
        id: string;
        first_name: string;
        last_name: string;
        institutions: string[];
        avatar_url?: string;
    } = {
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      institutions: institutions,
    };
    
    // This object is for updating the Supabase Auth user_metadata.
    const userMetaDataToUpdate: { first_name: string, last_name: string, avatar_url?: string } = {
        first_name: firstName,
        last_name: lastName,
    };


    if (profileImageFile && profileImageFile.size > 0) {
        const fileExt = profileImageFile.name.split('.').pop();
        const filePath = `${user.id}/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, profileImageFile, { upsert: true });

        if (uploadError) {
            throw new Error(`Error al subir el avatar: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = urlData.publicUrl;
        
        profileDataToUpdate.avatar_url = avatarUrl;
        userMetaDataToUpdate.avatar_url = avatarUrl;
    }

    // 1. Update the 'profiles' table
    const { data, error: profileUpsertError } = await supabase
      .from('profiles')
      .upsert(profileDataToUpdate)
      .select()
      .single();
    
    if (profileUpsertError) {
      if (profileUpsertError.message.includes('permission denied')) {
        throw new Error('Error de permisos. Asegúrate de que las políticas de RLS en Supabase permiten la operación de UPSERT.');
      }
      throw profileUpsertError;
    }
    
    // 2. Update the user metadata in Supabase Auth to ensure consistency
    const { error: userUpdateError } = await supabase.auth.updateUser({
        data: userMetaDataToUpdate,
    });

    if (userUpdateError) {
        console.error(`Error al sincronizar metadatos del usuario: ${userUpdateError.message}`);
    }
    
    revalidatePath('/dashboard/profile');
    return { data, error: null };

  } catch (e) {
      console.error("Update Profile Error:", e);
      const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido al actualizar el perfil.';
      return { data: null, error: errorMessage };
  }
}
