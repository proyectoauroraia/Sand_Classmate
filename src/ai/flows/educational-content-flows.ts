
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
      "The educational document (PDF or DOCX) as a data URI ('data:<mime-type>;base64,...')."
    ),
});

const UnitSchema = z.object({
  title: z.string().describe("The title of the unit or module."),
  learningObjectives: z.array(z.string()).describe("A list of specific learning objectives for this unit."),
});

const AssessmentSchema = z.object({
  type: z.string().describe("The type of assessment (e.g., Midterm Exam, Final Project, Quiz)."),
  description: z.string().describe("A brief description of the assessment."),
});


const AnalyzeContentOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the document\'s key topics and structure.').optional(),
  keyConcepts: z
    .array(z.string())
    .describe('A list of the most important terms and concepts found in the document.').optional(),
  subjectArea: z
    .string()
    .describe('The subject area or field of study identified from the document.'),
  weeks: z.union([z.number(), z.string()]).describe('The total number of weeks the course or syllabus covers.').optional(),
  
  courseStructure: z.array(UnitSchema).describe("A list of the course units or modules, each with its own title and learning objectives.").optional(),
  assessments: z.array(AssessmentSchema).describe("A list of the course assessments, including type and description.").optional(),
  
  bibliography: z.object({
      mentioned: z.array(z.string()).describe('A list of bibliographic references or source materials mentioned directly in the document.'),
      recommended: z.array(z.string()).describe('A list of relevant, modern external bibliographic recommendations (books, key articles) that are NOT in the original document but are highly relevant to the subject area.'),
  }).optional(),

  enrichedContent: z.object({
    externalLinks: z.array(z.object({
      title: z.string().describe("The title of the article or resource."),
      url: z.string().url().describe("The URL to the resource."),
      summary: z.string().describe("A brief summary of why this link is relevant.")
    })).describe("A list of relevant, modern external links (articles, studies, etc.) to enrich the content."),
    youtubeVideos: z.array(z.object({
      title: z.string().describe("The title of the YouTube video."),
      videoId: z.string().describe("The YouTube video ID."),
      summary: z.string().describe("A brief summary of what the video covers and why it's relevant.")
    })).describe("A list of relevant YouTube videos to complement the key concepts."),
  }).describe("A collection of modern, high-quality educational resources to enhance the original document.")
});

export async function analyzeAndEnrichContent(
  input: z.infer<typeof AnalyzeContentInputSchema>
): Promise<z.infer<typeof AnalyzeContentOutputSchema>> {
  const analysisPrompt = ai.definePrompt({
      name: 'contentAnalysisPrompt',
      input: { schema: AnalyzeContentInputSchema },
      output: { schema: AnalyzeContentOutputSchema },
      prompt: `You are an expert academic and pedagogical assistant. Your task is to perform a deep and structured analysis of the provided educational document (syllabus, course notes, etc.).

      Document: {{media url=documentDataUri}}

      1.  **Identify Subject Area:** Determine the specific field of study (e.g., Kinesiology, Nutrition, Philosophy).
      2.  **Summarize:** Provide a concise summary of the document's main topics and overall structure.
      3.  **Extract Key Information:**
          *   Identify and list the most critical **keywords and concepts**.
          *   Determine the total duration in **weeks** if specified.
      4.  **Deconstruct Course Structure:**
          *   Identify the main **units, modules, or weekly topics**. For each one, list its specific **learning objectives**.
          *   Identify all **assessments** (exams, quizzes, projects) mentioned in the document.
      5.  **Analyze Bibliography:**
          *   List any **bibliography** or references **mentioned** directly in the document.
          *   Provide a list of 2-3 additional **recommended bibliographic sources** (influential books, seminal papers) that are highly relevant but *not* mentioned in the document.
      6.  **Enrich with Modern Resources:** Based on the key concepts, find and provide a list of high-quality, modern educational resources. For each resource, provide a title, a URL (or video ID for YouTube), and a brief summary of its relevance.
          *   Find 2-3 relevant **academic articles or web pages**.
          *   Find 2-3 relevant **YouTube videos** that explain the concepts visually or practically.

      Provide a structured JSON response according to the defined output schema. Ensure all fields are populated accurately.`
  });
  
  const { output } = await analysisPrompt(input);
  return output!;
}


// Schema for generating a specific material from analysis
const GenerateMaterialInputSchema = z.object({
    analysisResult: z.object({
        summary: z.string().optional(),
        keyConcepts: z.array(z.string()).optional(),
        subjectArea: z.string(),
        weeks: z.union([z.number(), z.string()]).optional(),
        courseStructure: z.array(UnitSchema).optional(),
        assessments: z.array(AssessmentSchema).optional(),
        bibliography: z.any().optional(),
        enrichedContent: z.any().optional(),
    }),
    materialType: z.enum(['powerpointPresentation', 'workGuide', 'exampleTests', 'interactiveReviewPdf']),
});

const MaterialPrompts = {
    powerpointPresentation: `
        Generate the content for a PowerPoint presentation based on the provided analysis.
        - The first H1 (#) should be the main title of the presentation.
        - Each subsequent H2 (##) should represent a new slide title, usually corresponding to a course unit.
        - Under each slide title, create 4-6 bullet points (*) summarizing the key information and learning objectives for that topic.
        - Ensure the content is clear, concise, and well-suited for a presentation format.
    `,
    workGuide: `
        Generate a comprehensive work guide in markdown format.
        - Use H2 (##) for main sections (like course units) and H3 (###) for subsections.
        - Include sections like "Learning Objectives", "Key Topics per Unit", "Suggested Activities", and "Further Reading".
        - Use bullet points (*) for detailed information within each section.
    `,
    exampleTests: `
        Generate a sample test with a variety of question types (multiple choice, true/false, short answer) covering the different units.
        - Use H2 (##) for each question, and indicate which unit it relates to if possible.
        - For multiple-choice questions, list options with a bullet point (*) and mark the correct one with "(Correcto)".
        - For short answer questions, provide a brief ideal answer.
    `,
    interactiveReviewPdf: `
        Create content for an interactive review guide.
        - Use H2 (##) for key questions or discussion prompts related to each course unit.
        - Under each question, use bullet points (*) to list key concepts, terms, or ideas that students should review to answer the prompt.
        - This should guide students in reviewing the material effectively unit by unit.
    `,
};


export async function generateMaterialFromAnalysis(
  input: z.infer<typeof GenerateMaterialInputSchema>
): Promise<string> {
    const { analysisResult, materialType } = input;

    const generationPrompt = ai.definePrompt({
        name: `generate${materialType}Prompt`,
        prompt: `You are an expert curriculum developer for the field of ${analysisResult.subjectArea}.
        
        You have been provided with a detailed analysis of a course document.
        
        **Analysis Summary:**
        ${analysisResult.summary}
        
        **Key Concepts:**
        ${analysisResult.keyConcepts?.join(', ')}

        **Course Structure:**
        ${analysisResult.courseStructure?.map(u => `- ${u.title}: ${u.learningObjectives.join(', ')}`).join('\n')}
        
        **Your Task:**
        ${MaterialPrompts[materialType]}
        
        Generate only the markdown content for the requested material. Do not include any other explanations or introductory text.
        `,
    });

    const { output } = await generationPrompt();
    return output as string;
}
