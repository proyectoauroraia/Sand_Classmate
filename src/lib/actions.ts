
'use server';

import { analyzeAndEnrichContent, generateMaterialFromAnalysis } from '@/ai/flows/educational-content-flows';
import type { AnalysisResult, CheckoutSessionResult, WebpayCommitResult, UserProfile, GeneratedMaterials } from '@/lib/types';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { generateFileHash } from '@/lib/utils';
import { subDays } from 'date-fns';


const AnalyzeInputSchema = z.object({
  documentDataUri: z.string().refine(
    (uri) => uri.startsWith('data:application/pdf;base64,') || uri.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,'),
    'Solo se admiten documentos PDF o DOCX.'
  ).refine(
      (uri) => {
        const parts = uri.split(',');
        if (parts.length !== 2) return false; // Ensure URI has the expected 'data:<mime>;base64,<data>' structure
        const base64Data = parts[1];
        try {
            // The length of a Base64-encoded string is approximately 4/3 of the original data size.
            // This calculation is a safe and fast approximation.
            const stringLength = base64Data.length;
            const sizeInBytes = Math.ceil(stringLength * (3 / 4));
            return sizeInBytes <= 10 * 1024 * 1024; // 10 MB
        } catch (e) {
            return false; // Invalid Base64 string
        }
      },
      'El archivo no debe superar los 10MB o tiene un formato de codificación inválido.'
  )
});

const ClassSchema = z.object({
    topic: z.string(),
});

const UnitSchema = z.object({
    title: z.string(),
    learningObjectives: z.array(z.string()),
    classes: z.array(ClassSchema),
});


const GenerateMaterialInputSchema = z.object({
    analysisResult: z.object({
        courseName: z.string(),
        summary: z.string().optional(),
        keyConcepts: z.array(z.string()).optional(),
        subjectArea: z.string(),
        courseStructure: z.array(UnitSchema).optional(),
        assessments: z.array(z.object({
          type: z.string(),
          description: z.string(),
          feedback: z.string(),
        })).optional(),
        bibliography: z.any().optional(),
    }),
    materialType: z.enum(['powerpointPresentation', 'workGuide', 'exampleTests', 'interactiveReviewPdf']),
    format: z.enum(['docx', 'pdf', 'pptx']),
    classContext: z.object({
        unitTitle: z.string(),
        classTopic: z.string(),
    }).optional(),
});


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


export async function analyzeContentAction(
  documentDataUri: string
): Promise<{ data: AnalysisResult | null; error: string | null }> {
  const validation = AnalyzeInputSchema.safeParse({ documentDataUri });
  if (!validation.success) {
    const error = validation.error.errors[0]?.message || 'Datos de entrada inválidos.';
    console.error("Analysis Action Validation Error:", validation.error.format());
    return { data: null, error };
  }
  
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: 'No estás autenticado.' };
  }
  
  const fileHash = generateFileHash(documentDataUri);
  const cacheTtl = subDays(new Date(), 30);

  // 1. Check cache first
  const { data: cachedData, error: cacheError } = await supabase
    .from('analysis_cache')
    .select('analysis_result')
    .eq('file_hash', fileHash)
    .eq('user_id', user.id)
    .gte('created_at', cacheTtl.toISOString())
    .single();

  if (cacheError && cacheError.code !== 'PGRST116') { // Ignore 'no rows found' error
    console.error("Cache check error:", cacheError);
    // Decide if we should proceed or return error. For now, let's proceed.
  }
  
  if (cachedData) {
    console.log("Returning cached analysis for hash:", fileHash);
    return { data: cachedData.analysis_result as AnalysisResult, error: null };
  }

  // 2. If not in cache, run analysis
  try {
    const analysisResult = await analyzeAndEnrichContent({
      documentDataUri,
    });
    
    // 3. Save to cache
    const { error: insertError } = await supabase
      .from('analysis_cache')
      .insert({
        file_hash: fileHash,
        file_name: 'user_uploaded_file', // Could be enhanced to get real filename
        analysis_result: analysisResult,
        user_id: user.id
      });
      
    if (insertError) {
      console.error("Error saving to cache:", insertError);
      // Don't block the user, just log the error
    }
    
    return { data: analysisResult, error: null };
  } catch (e) {
    console.error("Analysis Action Error:", e);
    const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
     if (errorMessage.includes('503')) {
        return { data: null, error: 'El servicio de IA está temporalmente sobrecargado. Por favor, inténtalo de nuevo en unos momentos.' };
    }
    return { data: null, error: `Falló el análisis del contenido: ${errorMessage}` };
  }
}

export async function generateMaterialsActionFromAnalysis(
  analysisResult: AnalysisResult,
  materialType: keyof GeneratedMaterials | 'powerpointPresentation',
  format: 'docx' | 'pdf' | 'pptx',
  classContext?: { unitTitle: string; classTopic: string }
): Promise<{ data: string | null; error: string | null }> {
    const validation = GenerateMaterialInputSchema.safeParse({ analysisResult, materialType, format, classContext });
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

        // For presentations, we now only return the markdown content.
        // The final PPTX generation happens in a separate action after user edits.
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

export async function createPptxAction(
    markdownContent: string,
    theme: string
): Promise<{ data: string | null; error: string | null }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        let userName: string | undefined;

        if(user) {
            const { data: profile } = await supabase.from('profiles').select('fullName').eq('id', user.id).single();
            userName = profile?.fullName;
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


const WEBPAY_API_BASE = "https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2";
const COMMERCE_CODE = process.env.WEBPAY_PLUS_COMMERCE_CODE;
const API_KEY = process.env.WEBPAY_PLUS_API_KEY;

export async function createCheckoutSessionAction(): Promise<{ data: CheckoutSessionResult | null; error: string | null }> {
    try {
        if (!COMMERCE_CODE || !API_KEY) {
            throw new Error("Las credenciales de Webpay no están configuradas en el servidor.");
        }

        const buy_order = `O-${Math.floor(Math.random() * 10000) + 1}`;
        const session_id = `S-${Math.floor(Math.random() * 10000) + 1}`;
        const amount = 12000;
        const return_url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/payment/return`;

        const headers = {
            "Tbk-Api-Key-Id": COMMERCE_CODE,
            "Tbk-Api-Key-Secret": API_KEY,
            "Content-Type": "application/json",
        };

        const response = await fetch(`${WEBPAY_API_BASE}/transactions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ buy_order, session_id, amount, return_url }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error_message || 'Error al crear la transacción en Webpay');
        }

        return { data, error: null };

    } catch (e) {
        console.error("Create Checkout Session Error:", e);
        const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
        return { data: null, error: `No se pudo crear la sesión de pago: ${errorMessage}` };
    }
}

export async function commitWebpayTransactionAction(
  token: string
): Promise<{ data: WebpayCommitResult | null; error: string | null }> {
    try {
        if (!token) {
            throw new Error("Token de Webpay no proporcionado.");
        }
         if (!COMMERCE_CODE || !API_KEY) {
            throw new Error("Las credenciales de Webpay no están configuradas en el servidor.");
        }
        
        const headers = {
            "Tbk-Api-Key-Id": COMMERCE_CODE,
            "Tbk-Api-Key-Secret": API_KEY,
            "Content-Type": "application/json",
        };

        const response = await fetch(`${WEBPAY_API_BASE}/transactions/${token}`, {
            method: 'PUT',
            headers,
        });

        const data: WebpayCommitResult = await response.json();

        if (!response.ok) {
            throw new Error(data.error_message || 'Error al confirmar la transacción en Webpay');
        }
        
        // If payment is authorized, you would update your database here.
        // For example: await updateUserToPremium(userId);
        
        return { data, error: null };

    } catch (e) {
        console.error("Commit Webpay Transaction Error:", e);
        const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
        return { data: null, error: `Falló la confirmación del pago: ${errorMessage}` };
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

    const fullName = formData.get('fullName') as string;
    if (!fullName || fullName.trim().length === 0) {
        return { data: null, error: 'El nombre completo es requerido.'};
    }
    
    const profileImageFile = formData.get('profileImage') as File | null;
    let avatarUrl: string | undefined = undefined;

    if (profileImageFile && profileImageFile.size > 0) {
        const fileExt = profileImageFile.name.split('.').pop();
        const filePath = `${user.id}/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, profileImageFile);

        if (uploadError) {
            throw new Error(`Error al subir el avatar: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = urlData.publicUrl;
    }

    const profileDataToUpdate: {
        id: string;
        fullName: string;
        role: string;
        institutions: string[];
        avatar_url?: string;
    } = {
      id: user.id,
      fullName,
      role: formData.get('role') as string,
      institutions: formData.getAll('institutions[]') as string[],
    };
    
    if (avatarUrl) {
      profileDataToUpdate.avatar_url = avatarUrl;
    }

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
    
    if (avatarUrl) {
        const { error: userUpdateError } = await supabase.auth.updateUser({
            data: { avatar_url: avatarUrl, full_name: fullName }
        });
         if (userUpdateError) {
            console.error(`Error al actualizar metadatos del usuario: ${userUpdateError.message}`);
        }
    }
    
    revalidatePath('/dashboard/profile');
    return { data, error: null };

  } catch (e) {
      console.error("Update Profile Error:", e);
      const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido al actualizar el perfil.';
      return { data: null, error: errorMessage };
  }
}
