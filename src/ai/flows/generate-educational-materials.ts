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
    .describe('The generated PowerPoint presentation content as a markdown string. Each H2 heading will be a new slide.'),
  workGuide: z.string().describe('The generated work guide content as a structured text string.'),
  exampleTests: z.string().describe('The generated example tests content as a structured text string.'),
  interactiveReviewPdf: z
    .string()
    .describe('The generated interactive review content as a structured text string.'),
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

You will take a syllabus file as input and generate the content for the following materials:

1.  **PowerPoint presentation content**: As a markdown string. Use H2 headings (##) to delineate each new slide. Create approximately 15 slides per class session found in the syllabus.
2.  **Work guide content**: As a well-structured text. Include sections, bullet points, and clear instructions.
3.  **Example tests content**: As a well-structured text. Include multiple-choice questions, true/false, and open-ended questions with an answer key at the end.
4.  **Interactive review content**: As a well-structured text. Include questions, key concepts, and topics for discussion.

Syllabus File: {{media url=syllabusFile}}

Ensure that the generated content is engaging, comprehensive, and appropriate for university students. Do not generate file data, only the text content for each item.
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
