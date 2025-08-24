'use server';

import { generateEducationalMaterials } from '@/ai/flows/generate-educational-materials';
import type { GeneratedMaterials } from '@/lib/types';
import { z } from 'zod';

const ActionInputSchema = z.object({
  syllabusFile: z.string().startsWith('data:'),
});

export async function generateMaterialsAction(
  dataUri: string
): Promise<{ data: GeneratedMaterials | null; error: string | null }> {
  const validation = ActionInputSchema.safeParse({ syllabusFile: dataUri });
  if (!validation.success) {
    return { data: null, error: 'Invalid data URI provided.' };
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
