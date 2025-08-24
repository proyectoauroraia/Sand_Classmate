'use server';

/**
 * @fileOverview This flow generates educational materials from a syllabus file.
 *
 * - generateEducationalMaterials - A function that generates educational materials from a syllabus file.
 * - GenerateEducationalMaterialsInput - The input type for the generateEducationalMaterials function.
 * - GenerateEducationalMaterialsOutput - The return type for the generateEducationalMaterials function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEducationalMaterialsInputSchema = z.object({
  syllabusFile: z
    .string()
    .describe(
      "The syllabus file (PDF) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type GenerateEducationalMaterialsInput = z.infer<typeof GenerateEducationalMaterialsInputSchema>;

const GenerateEducationalMaterialsOutputSchema = z.object({
  powerpointPresentation: z
    .string()
    .describe('The generated PowerPoint presentation content as a markdown string.'),
  workGuide: z.string().describe('The generated work guide in PDF format as a data URI.'),
  exampleTests: z.string().describe('The generated example tests as a data URI.'),
  interactiveReviewPdf: z
    .string()
    .describe('The generated interactive review PDF as a data URI.'),
});
export type GenerateEducationalMaterialsOutput = z.infer<typeof GenerateEducationalMaterialsOutputSchema>;

export async function generateEducationalMaterials(
  input: GenerateEducationalMaterialsInput
): Promise<GenerateEducationalMaterialsOutput> {
  return generateEducationalMaterialsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEducationalMaterialsPrompt',
  input: {schema: GenerateEducationalMaterialsInputSchema},
  output: {schema: GenerateEducationalMaterialsOutputSchema},
  prompt: `You are an AI assistant designed to help university professors generate educational materials from their syllabus.

You will take a syllabus file as input and generate the following materials:

1.  PowerPoint presentation content as a markdown string (approximately 15 slides per class).
2.  Work guide in PDF format
3.  Example tests
4.  Interactive review PDF

Syllabus File: {{media url=syllabusFile}}

Ensure that the generated materials are engaging and appropriate for university students.

Return the work guide, example tests, and interactive review as data URIs. Return the presentation as a markdown string.
`,
});

const generateEducationalMaterialsFlow = ai.defineFlow(
  {
    name: 'generateEducationalMaterialsFlow',
    inputSchema: GenerateEducationalMaterialsInputSchema,
    outputSchema: GenerateEducationalMaterialsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
