'use server';

import { generateEducationalMaterials } from '@/ai/flows/generate-educational-materials';
import type { GeneratedMaterials } from '@/lib/types';
import { z } from 'zod';

// More specific validation for PDF data URI
const ActionInputSchema = z.object({
  syllabusFile: z.string().refine(
    (uri) => uri.startsWith('data:application/pdf;base64,') || uri.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,'),
    {
      message: 'Invalid file type. Only PDF or Word documents are supported.',
    }
  ),
});


export async function generateMaterialsAction(
  dataUri: string
): Promise<{ data: GeneratedMaterials | null; error: string | null }> {
  const validation = ActionInputSchema.safeParse({ syllabusFile: dataUri });
  if (!validation.success) {
    const error = validation.error.errors[0]?.message || 'Invalid data URI provided.';
    return { data: null, error };
  }
  
  try {
    const result = await generateEducationalMaterials({
      syllabusFile: dataUri,
    });
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error: `Failed to generate materials: ${errorMessage}` };
  }
}
