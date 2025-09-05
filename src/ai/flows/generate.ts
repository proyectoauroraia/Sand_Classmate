
'use server';

import { z } from 'zod';
import { ai } from '../genkit';
import { MODELS } from '../models';
import type { AnalysisResult } from '@/lib/types';


export const generateMaterialFromAnalysis = ai.defineFlow({
  name: 'generateMaterialFromAnalysis',
  inputSchema: z.object({
    analysisResult: z.any(),
    materialType: z.enum(['powerpointPresentation', 'workGuide', 'exampleTests', 'interactiveReviewPdf']),
    classContext: z.object({
        unitTitle: z.string(),
        classTopic: z.string(),
    }).optional(),
  }),
  outputSchema: z.string().describe("The full content for the requested educational material, formatted in Markdown and written entirely in Spanish."),
  handler: async (input) => {
    const { analysisResult, materialType, classContext } = input;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort('timeout'), 45_000);
    
    let userPrompt = '';
    const systemPrompt = "Eres un asistente experto en creación de material pedagógico para docentes. Genera el contenido solicitado en formato Markdown, bien estructurado, claro y listo para ser usado en una clase universitaria. El idioma de toda la salida debe ser español.";

    switch (materialType) {
        case 'powerpointPresentation':
            if (classContext) {
                 userPrompt = `Basado en el análisis general del curso, crea el contenido para una presentación de PowerPoint sobre el tema específico: "${classContext.classTopic}" dentro de la unidad "${classContext.unitTitle}". Estructura la salida con un título principal (#) y varias diapositivas (##), cada una con 3-5 puntos clave (*). Incluye una diapositiva de título, una de introducción, varias de contenido y una de conclusión. Análisis del curso para contexto: ${JSON.stringify(analysisResult)}`;
            } else {
                 userPrompt = `Crea el contenido para una presentación de PowerPoint que resuma todo el curso analizado. Estructura la salida con un título principal (#) y varias diapositivas (##) para cada unidad principal, cada una con 3-5 puntos clave (*). Análisis del curso: ${JSON.stringify(analysisResult)}`;
            }
            break;
        case 'workGuide':
            userPrompt = `Crea una guía de trabajo para estudiantes sobre el curso completo. Incluye una introducción, objetivos, una serie de 5-7 actividades prácticas o preguntas de desarrollo, y una breve pauta de evaluación. Análisis del curso: ${JSON.stringify(analysisResult)}`;
            break;
        case 'exampleTests':
             userPrompt = `Crea un examen de ejemplo para una de las evaluaciones descritas en el análisis. Elige la evaluación más representativa. El examen debe tener una mezcla de 5 a 8 preguntas de opción múltiple, verdadero/falso y/o desarrollo breve. Incluye una pauta de corrección o respuesta ideal para cada pregunta. Análisis de las evaluaciones del curso: ${JSON.stringify(analysisResult.assessments)}`;
            break;
        case 'interactiveReviewPdf':
            userPrompt = `Crea el contenido para un material de repaso interactivo. Debe incluir 10 preguntas de autoevaluación (ej. opción múltiple), un glosario con los 5 conceptos más importantes y enlaces a 2-3 de los videos de repaso sugeridos en el análisis. Formatea claramente cada sección. Análisis del curso: ${JSON.stringify(analysisResult)}`;
            break;
    }

    try {
      const { output } = await ai.generate({
        model: MODELS.GENERATE,
        temperature: 0.4,
        abortSignal: controller.signal,
        prompt: `${systemPrompt}\n\n${userPrompt}`,
      });

      return output ?? '';

    } finally {
      clearTimeout(timeout);
    }
  },
});
