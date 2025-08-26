
'use server';
/**
 * @fileOverview A flow for analyzing a user's CV to extract their pedagogical philosophy.
 * - analyzeCv: Extracts professional and pedagogical summary from a CV.
 * - AnalyzeCvInput: The input type for the analyzeCv function.
 * - AnalyzeCvOutput: The return type for the analyzeCv function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeCvInputSchema = z.object({
  cvDataUri: z
    .string()
    .describe(
      "A curriculum vitae (CV) document, as a data URI ('data:<mime-type>;base64,...')."
    ),
});
export type AnalyzeCvInput = z.infer<typeof AnalyzeCvInputSchema>;

const AnalyzeCvOutputSchema = z.object({
  bio: z.string().describe("A concise summary (2-3 paragraphs) of the user's professional career, specializations, and pedagogical philosophy, synthesized from their CV. This text should be written in the first person ('Soy un académico con foco en...') and in Spanish."),
  keyPoints: z.array(z.string()).describe("A concise list of 3-5 key points summarizing the user's profile, such as main specialization, key roles, and pedagogical approach. Each point must be in Spanish."),
});
export type AnalyzeCvOutput = z.infer<typeof AnalyzeCvOutputSchema>;


const cvAnalysisPrompt = ai.definePrompt({
    name: 'cvAnalysisPrompt',
    input: { schema: AnalyzeCvInputSchema },
    output: { schema: AnalyzeCvOutputSchema },
    prompt: `You are an expert in academic and professional profiling. Your task is to analyze the provided Curriculum Vitae (CV) and synthesize a professional and pedagogical biography, along with a list of key points.

    Document: {{media url=cvDataUri}}

    Follow these steps:
    1.  **Identify Key Information:** Read the entire CV to understand the user's career trajectory, field of expertise, academic roles, publications, and any stated teaching philosophies or methodologies.

    2.  **Synthesize a Biography:** Based on the information, write a concise summary of 2-3 paragraphs. This summary MUST be:
        *   **In Spanish:** The entire output must be in Spanish.
        *   **In the First Person:** Frame the text as if the user is writing it (e.g., "Soy un profesional con experiencia en...", "Mi enfoque pedagógico se centra en...").
        *   **Comprehensive:** It should cover their main area of expertise (e.g., "kinesiología respiratoria", "nutrición clínica"), key achievements or roles (e.g., "Director de Carrera", "investigador en..."), and pedagogical approach (e.g., "constructivista", "aprendizaje basado en competencias", "uso de tecnologías en el aula").

    3.  **Extract Key Points:** Create a short, concise list of 3 to 5 bullet points summarizing the most important aspects of the profile. These should be easy-to-scan highlights. Examples: "Especialista en Neurología del Adulto", "Magíster en Docencia para Educación Superior", "Enfoque en aprendizaje activo y basado en evidencia", "Experiencia integrando IA en la educación". Each point must be in Spanish.
    
    4.  **Format the Output:** Provide the final text in the 'bio' field and the key points in the 'keyPoints' field of the JSON output.

    Example Output:
    {
      "bio": "Soy un kinesiólogo con más de 15 años de experiencia, especializado en el área de rehabilitación neurológica en adultos. Durante mi carrera, he sido docente en varias universidades y he desarrollado proyectos de investigación sobre la aplicación de nuevas tecnologías en la terapia motora. Mi filosofía pedagógica se basa en el aprendizaje activo y el constructivismo, buscando que los estudiantes conecten la teoría con casos clínicos reales para desarrollar un pensamiento crítico y habilidades prácticas. Me apasiona la formación de profesionales autónomos, capaces de enfrentar los desafíos complejos del sistema de salud.",
      "keyPoints": [
        "Especialista en Kinesiología Neurológica de Adultos",
        "Investigador en aplicación de nuevas tecnologías en terapia",
        "Filosofía pedagógica constructivista y de aprendizaje activo",
        "Foco en la conexión entre teoría y casos clínicos reales"
      ]
    }
    `
});


export const analyzeCv = ai.defineFlow(
  {
    name: 'analyzeCvFlow',
    inputSchema: AnalyzeCvInputSchema,
    outputSchema: AnalyzeCvOutputSchema,
  },
  async (input) => {
    const { output } = await cvAnalysisPrompt(input);
    return output!;
  }
);
