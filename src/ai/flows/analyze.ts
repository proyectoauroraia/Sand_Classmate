
'use server';

import { z } from 'zod';
import { ai } from '../genkit';
import { MODELS } from '../models';
import { fetchTextFromSupabase } from '@/lib/files/fetchText';
import { safeJson } from '@/lib/utils/safeJson';
import type { AnalysisResult } from '@/lib/types';


const AnalysisOutputSchema = z.object({
  courseName: z.string().describe("El nombre completo y formal de la asignatura o curso."),
  subjectArea: z.string().describe("El área de conocimiento o carrera a la que pertenece el curso (ej. 'Ingeniería Civil', 'Psicología', 'Medicina')."),
  summary: z.string().describe("Un resumen conciso del propósito y contenido general del documento, en 2-3 frases."),
  keyConcepts: z.array(z.string()).describe("Una lista de 5 a 10 conceptos, términos o ideas fundamentales que son centrales en el documento."),
  courseStructure: z.array(z.object({
    title: z.string().describe("El título de la unidad, módulo o sección principal."),
    learningObjectives: z.array(z.string()).describe("Los objetivos de aprendizaje específicos para esa unidad."),
    classes: z.array(z.object({
      topic: z.string().describe("El tema específico de una clase o sesión dentro de la unidad.")
    })).describe("Una lista de las clases o temas que componen la unidad.")
  })).optional().describe("La estructura del curso, dividida en unidades o módulos."),
  assessments: z.array(z.object({
    type: z.string().describe("El tipo de evaluación (ej. 'Prueba Parcial', 'Examen Final', 'Ensayo', 'Proyecto')."),
    description: z.string().describe("Una breve descripción de lo que cubre la evaluación."),
    feedback: z.string().describe("El resultado de aprendizaje o competencia que esta evaluación mide, reformulado como un feedback para el estudiante."),
  })).optional().describe("Una lista de las evaluaciones planificadas en el curso."),
  bibliography: z.object({
    mentioned: z.array(z.string()).optional().describe("Lista de textos o autores mencionados explícitamente en el documento."),
    recommended: z.array(z.string()).optional().describe("Lista de hasta 5 textos, autores o recursos adicionales que la IA recomienda para complementar el curso.")
  }).optional().describe("La bibliografía del curso."),
  linksOfInterest: z.array(z.object({ title: z.string(), url: z.string().url() })).describe("Una lista de 3 a 5 URLs a recursos externos relevantes (artículos, simuladores, sitios web) con su título descriptivo."),
  reviewVideos: z.array(z.object({ title: z.string(), url: z.string().url() })).describe("Una lista de 3 a 5 URLs a videos de YouTube u otras plataformas que ayuden a repasar los conceptos clave, con su título descriptivo."),
  activeMethodologies: z.array(z.object({ name: z.string(), description: z.string() })).describe("Una lista de 2 a 3 metodologías de enseñanza activas (ej. 'Aprendizaje Basado en Proyectos', 'Clase Invertida') que serían adecuadas para este curso, con una breve descripción de cómo aplicarlas."),
});


export const analyzeAndEnrichContent = ai.defineFlow({
  name: 'analyzeAndEnrichContent',
  inputSchema: z.object({
    fileKey: z.string().min(3),
  }),
  outputSchema: AnalysisOutputSchema.extend({
      tokens: z.number().int(),
      promptVersion: z.string(),
  }),
  handler: async (input) => {
    const controller = new AbortController();
    // A generous timeout for analysis of a potentially large file
    const timeout = setTimeout(() => controller.abort('timeout'), 90_000);

    try {
      // For now, fetchTextFromSupabase is a placeholder. 
      // In a real implementation, it would download the file from Storage via fileKey and extract text.
      const text = await fetchTextFromSupabase(input.fileKey, {
        signal: controller.signal,
      });

      const promptVersion = 'analyse.v1.1.0';
      
      const { output, usage } = await ai.generate({
        model: MODELS.ANALYZE,
        temperature: 0.2,
        output: { schema: AnalysisOutputSchema },
        abortSignal: controller.signal,
        prompt: `Eres un asistente experto en diseño instruccional para docentes universitarios. Tu tarea es analizar un documento académico (programa de curso, apuntes, etc.) y estructurar la información de manera útil para el docente. Analiza el siguiente texto y devuelve un objeto JSON que siga estrictamente el esquema definido. Sé exhaustivo y preciso. El idioma de toda la salida debe ser español.\n\nTexto del documento:\n\n${text}`,
      });

      if (!output) {
        throw new Error("Analysis result was empty.");
      }

      return {
        ...output,
        tokens: usage?.totalTokens ?? 0,
        promptVersion,
      };
    } finally {
      clearTimeout(timeout);
    }
  },
});
