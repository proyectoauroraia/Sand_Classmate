'use server';
/**
 * @fileOverview Flows for analyzing and generating educational content.
 * - analyzeAndEnrichContent: Analyzes a document, summarizes it, and enriches it with scientific context.
 * - generateMaterialFromAnalysis: Generates specific educational materials based on a prior analysis.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { AnalysisResult } from '@/lib/types';

// Schema for analyzing content
const AnalyzeContentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The educational document (PDF) as a data URI ('data:application/pdf;base64,...')."
    ),
});

const AnalyzeContentOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the document\'s key topics and structure.'),
  keyConcepts: z
    .array(z.string())
    .describe('A list of the most important terms and concepts found in the document.'),
  scientificContext: z
    .string()
    .describe(
      'An enrichment of the content with scientific principles, foundational theories, or relevant context from the identified subject area.'
    ),
  subjectArea: z
    .string()
    .describe('The subject area or field of study identified from the document.')
});

export async function analyzeAndEnrichContent(
  input: z.infer<typeof AnalyzeContentInputSchema>
): Promise<z.infer<typeof AnalyzeContentOutputSchema>> {
  const analysisPrompt = ai.definePrompt({
      name: 'contentAnalysisPrompt',
      input: { schema: AnalyzeContentInputSchema },
      output: { schema: AnalyzeContentOutputSchema },
      prompt: `You are an expert academic assistant. Your task is to analyze the provided educational document and extract key information.

      Document: {{media url=documentDataUri}}

      1.  **Identify Subject Area:** First, determine the specific field of study or subject area of the document (e.g., Kinesiology, Nutrition, Electrical Engineering, Philosophy).
      2.  **Summarize:** Read the entire document and provide a concise summary of its main topics, objectives, and overall structure.
      3.  **Extract Key Concepts:** Identify and list the most critical keywords, phrases, and concepts discussed.
      4.  **Enrich with Scientific Context:** Based on the content and the subject area you identified, provide a brief explanation of the underlying scientific principles, relevant theories, or foundational knowledge that complements the material. Connect the document's topics to established knowledge in the identified field.

      Provide a structured response with the identified subject area, a clear summary, a list of key concepts, and the enriched scientific context.`
  });
  
  const { output } = await analysisPrompt(input);
  return output!;
}


// Schema for generating a specific material from analysis
const GenerateMaterialInputSchema = z.object({
    analysisResult: z.object({
        summary: z.string(),
        keyConcepts: z.array(z.string()),
        scientificContext: z.string(),
        subjectArea: z.string(),
    }),
    materialType: z.enum(['powerpointPresentation', 'workGuide', 'exampleTests', 'interactiveReviewPdf']),
});

const MaterialPrompts = {
    powerpointPresentation: `
        Generate the content for a PowerPoint presentation based on the provided analysis.
        - The first H1 (#) should be the main title of the presentation.
        - Each subsequent H2 (##) should represent a new slide title.
        - Under each slide title, create 4-6 bullet points (*) summarizing the key information for that topic.
        - Ensure the content is clear, concise, and well-suited for a presentation format.
    `,
    workGuide: `
        Generate a comprehensive work guide in markdown format.
        - Use H2 (##) for main sections and H3 (###) for subsections.
        - Include sections like "Learning Objectives", "Key Topics", "Activities and Exercises", and "Further Reading".
        - Use bullet points (*) for detailed information within each section.
    `,
    exampleTests: `
        Generate a sample test with a variety of question types (multiple choice, true/false, short answer).
        - Use H2 (##) for each question.
        - For multiple-choice questions, list options with a bullet point (*) and mark the correct one with "(Correcto)".
        - For short answer questions, provide a brief ideal answer.
    `,
    interactiveReviewPdf: `
        Create content for an interactive review guide.
        - Use H2 (##) for key questions or discussion prompts.
        - Under each question, use bullet points (*) to list key concepts, terms, or ideas that students should review to answer the prompt.
        - This should guide students in reviewing the material effectively.
    `,
};


export async function generateMaterialFromAnalysis(
  input: z.infer<typeof GenerateMaterialInputSchema>
): Promise<string> {
    const { analysisResult, materialType } = input;

    const generationPrompt = ai.definePrompt({
        name: `generate${materialType}Prompt`,
        prompt: `You are an expert curriculum developer for the field of ${analysisResult.subjectArea}.
        
        You have been provided with an analysis of a course document, which includes a summary, key concepts, and scientific context.
        
        **Analysis Summary:**
        ${analysisResult.summary}
        
        **Key Concepts:**
        ${analysisResult.keyConcepts.join(', ')}
        
        **Scientific Context:**
        ${analysisResult.scientificContext}
        
        **Your Task:**
        ${MaterialPrompts[materialType]}
        
        Generate only the markdown content for the requested material. Do not include any other explanations or introductory text.
        `,
    });

    const { output } = await generationPrompt();
    return output as string;
}
