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
    .describe("The generated PowerPoint presentation content as a markdown string. The first H1 (#) is the title slide. Each subsequent H2 (##) is a new slide title. Bullet points (*) are slide content."),
  workGuide: z.string().describe('The generated work guide content as a markdown string with titles (##), subtitles (###), and bullet points (*).'),
  exampleTests: z.string().describe('The generated example tests content as a markdown string with questions (##) and options/answers (*).'),
  interactiveReviewPdf: z
    .string()
    .describe('The generated interactive review content as a markdown string with questions (##) and key concepts (*).'),
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

You will take a syllabus file as input and generate the content for the following materials in **well-structured markdown format**.

1.  **PowerPoint presentation content**: Start with a main title for the presentation using an H1 (#). Then, for each class session in the syllabus, create a slide title using an H2 (##). Under each H2, create about 4-5 bullet points (*) summarizing the key topics for that session.

2.  **Work guide content**: Create a comprehensive work guide. Use H2 (##) for main sections (like "Unit 1: Introduction"), H3 (###) for subsections (like "Objectives" or "Activities"), and bullet points (*) for details within each subsection.

3.  **Example tests content**: Create a test with a mix of question types. Use H2 (##) for each question. For multiple-choice questions, list the options using bullet points (*), and indicate the correct answer with "(Correct)".

4.  **Interactive review content**: Create a review guide. Use H2 (##) for questions or discussion prompts, and use bullet points (*) to list key concepts or terms for review under each prompt.

Syllabus File: {{media url=syllabusFile}}

Ensure the markdown is clean and well-organized. Do not generate any other text or explanations, only the markdown content for each item.
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
