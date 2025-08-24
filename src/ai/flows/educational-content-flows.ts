
'use server';
/**
 * @fileOverview Flows for analyzing and generating educational content.
 * - analyzeAndEnrichContent: Analyzes a document, summarizes it, and enriches it with scientific context.
 * - generateMaterialFromAnalysis: Generates specific educational materials based on a prior analysis.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
  feedback: z.string().describe("The feedback or learning outcome associated with the assessment. What should the student demonstrate?"),
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
  
  coherenceAnalysis: z.string().describe("Critical analysis on the coherence between learning outcomes, planning, and evaluation methods found in the document.").optional(),
  strengths: z.array(z.string()).describe("A list of strengths found in the provided document's pedagogical structure or content.").optional(),
  weaknesses: z.array(z.string()).describe("A list of weaknesses or areas for improvement in the document.").optional(),
  recommendations: z.array(z.string()).describe("A list of actionable recommendations to improve the document.").optional(),

  courseStructure: z.array(UnitSchema).describe("A list of the course units or modules, each with its own title and learning objectives.").optional(),
  assessments: z.array(AssessmentSchema).describe("A list of the course assessments, including type, description, and feedback/learning outcome.").optional(),
  
  bibliography: z.object({
      mentioned: z.array(z.string()).describe('A list of bibliographic references or source materials mentioned directly in the document.').optional(),
      recommended: z.array(z.string()).describe('A list of relevant, modern external bibliographic recommendations (books, key articles) that are NOT in the original document but are highly relevant to the subject area. Prioritize resources from the last 5 years from reliable sources like .edu, .gov domains, or academic journals.'),
  }).optional(),

});

export async function analyzeAndEnrichContent(
  input: z.infer<typeof AnalyzeContentInputSchema>
): Promise<z.infer<typeof AnalyzeContentOutputSchema>> {
  const analysisPrompt = ai.definePrompt({
      name: 'contentAnalysisPrompt',
      input: { schema: AnalyzeContentInputSchema },
      output: { schema: AnalyzeContentOutputSchema },
      prompt: `You are an expert university pedagogy assistant. Your task is to perform a deep, critical, and structured analysis of the provided educational document (syllabus, exam, course plan, etc.). Your analysis must be coherent, constructive, and based on pedagogical principles like Bloom's Taxonomy.

      IMPORTANT: All generated text, summaries, titles, and descriptions MUST be in Spanish.

      Document: {{media url=documentDataUri}}

      Follow these steps for your analysis:

      1.  **Basic Information Extraction:**
          *   **Subject Area:** Identify the specific field of study (e.g., Kinesiology, Nutrition, Philosophy).
          *   **Summary:** Provide a concise summary of the document's main topics and purpose.
          *   **Key Concepts:** List the most critical keywords and concepts.
          *   **Course Structure & Assessments:** Identify units, learning objectives, and assessments as defined in the schema.

      2.  **Critical Pedagogical Analysis:**
          *   **Coherence Analysis:** Critically evaluate the alignment between the stated **Learning Outcomes** (or general learning goals) and the **Evaluation Methods** (exams, projects). Does the exam truly measure the analytical and application skills mentioned in the plan, or does it only measure memorization? Identify any misalignments.
          *   **Strengths:** Identify the strong points of the document. (e.g., "Variedad de formatos de preguntas", "Cobertura temática amplia", "Lenguaje claro").
          *   **Weaknesses:** Identify the pedagogical weaknesses. Be specific. (e.g., "Predominio de la memorización, alejándose del nivel de análisis requerido", "Escasa evaluación de razonamiento clínico", "Formato de verdadero/falso poco pertinente para medir competencias").
          *   **Actionable Recommendations:** Provide concrete recommendations for improvement based on your analysis. Use a pedagogical framework. (e.g., "Incorporar casos clínicos contextualizados para evaluar análisis y aplicación", "Aumentar el peso de preguntas de desarrollo usando la taxonomía de Bloom para pasar de 'recordar' a 'aplicar' o 'analizar'", "Diseñar una rúbrica explícita para respuestas cortas").

      3.  **Bibliography Analysis:**
          *   List any bibliography mentioned.
          *   Provide 2-3 **highly relevant, modern recommended bibliographic sources** not mentioned in the document. Prioritize academic sources from the last 5-10 years.

      Provide a structured JSON response according to the defined output schema. Ensure all fields are populated accurately and in Spanish.`
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
        coherenceAnalysis: z.string().optional(),
        strengths: z.array(z.string()).optional(),
        weaknesses: z.array(z.string()).optional(),
        recommendations: z.array(z.string()).optional(),
        courseStructure: z.array(UnitSchema).optional(),
        assessments: z.array(AssessmentSchema).optional(),
        bibliography: z.any().optional(),
    }),
    materialType: z.enum(['powerpointPresentation', 'workGuide', 'exampleTests', 'interactiveReviewPdf']),
});

const GenerateMaterialOutputSchema = z.object({
  markdownContent: z.string().describe("The full content for the requested educational material, formatted in Markdown and written entirely in Spanish."),
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
        - Include sections like "Objetivos de Aprendizaje", "Temas Clave por Unidad", "Actividades Sugeridas", and "Lecturas Adicionales".
        - Use bullet points (*) for detailed information within each section.
    `,
    exampleTests: `
        Generate a new, improved sample test.
        - **Crucially, use the 'weaknesses' and 'recommendations' from the analysis to build a better exam.** For example, if the analysis recommended using clinical cases, you MUST incorporate clinical cases. If it recommended moving up Bloom's taxonomy, your questions must require application or analysis, not just memorization.
        - Use H2 (##) to title each section (e.g., "## Caso Clínico 1", "## Preguntas de Aplicación").
        - Use H3 (###) for each question, indicating its type (e.g., "### 1. Pregunta de Análisis (Selección Múltiple)").
        - For multiple-choice questions, list options with a bullet point (*) and mark the correct one with "(Correcta)".
        - For short answer or development questions, provide a brief ideal answer or a rubric under a title like "Pauta de Corrección:".
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
        input: { schema: z.any() },
        output: { schema: GenerateMaterialOutputSchema },
        prompt: `You are an expert curriculum developer for the field of ${analysisResult.subjectArea}.
        
        You have been provided with a detailed pedagogical analysis of a course document. Use all the information below to generate the requested material.
        
        IMPORTANT: All generated content MUST be in Spanish. The markdown output must be entirely in Spanish.

        **Subject Area:** ${analysisResult.subjectArea}
        **Course Summary:** ${analysisResult.summary}
        **Key Concepts:** ${analysisResult.keyConcepts?.join(', ')}
        **Coherence Analysis:** ${analysisResult.coherenceAnalysis}
        **Identified Weaknesses:** ${analysisResult.weaknesses?.join(', ')}
        **Improvement Recommendations:** ${analysisResult.recommendations?.join(', ')}
        
        **Your Specific Task:**
        Based on all the data above, generate content for the following material: **${materialType}**.
        Follow these instructions precisely:
        ${MaterialPrompts[materialType]}
        
        Generate the content in Markdown and place it in the 'markdownContent' field of the JSON output.
        `,
    });

    const { output } = await generationPrompt(input);
    return output?.markdownContent || '';
}

    