'use server';
/**
 * @fileOverview Summarizes educational content from a document.
 *
 * - summarizeEducationalContent - A function that summarizes educational content from a document.
 * - SummarizeEducationalContentInput - The input type for the summarizeEducationalContent function.
 * - SummarizeEducationalContentOutput - The return type for the summarizeEducationalContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeEducationalContentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document containing educational content, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>' for a PDF or Word document."
    ),
});
export type SummarizeEducationalContentInput = z.infer<typeof SummarizeEducationalContentInputSchema>;

const SummarizeEducationalContentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key topics and concepts in the document.'),
});
export type SummarizeEducationalContentOutput = z.infer<typeof SummarizeEducationalContentOutputSchema>;

export async function summarizeEducationalContent(input: SummarizeEducationalContentInput): Promise<SummarizeEducationalContentOutput> {
  return summarizeEducationalContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeEducationalContentPrompt',
  input: {schema: SummarizeEducationalContentInputSchema},
  output: {schema: SummarizeEducationalContentOutputSchema},
  prompt: `You are an expert in summarizing educational content. Please provide a concise summary of the key topics and concepts in the following document:

Document: {{media url=documentDataUri}}`,
});

const summarizeEducationalContentFlow = ai.defineFlow(
  {
    name: 'summarizeEducationalContentFlow',
    inputSchema: SummarizeEducationalContentInputSchema,
    outputSchema: SummarizeEducationalContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
