
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

const ClassSchema = z.object({
    topic: z.string().describe("The specific topic of this class session."),
});

const UnitSchema = z.object({
  title: z.string().describe("The title of the unit or module."),
  learningObjectives: z.array(z.string()).describe("A list of specific learning objectives for this unit."),
  classes: z.array(ClassSchema).describe("A list of individual classes or topics within this unit."),
});

const AssessmentSchema = z.object({
  type: z.string().describe("The type of assessment (e.g., Midterm Exam, Final Project, Quiz)."),
  description: z.string().describe("A brief description of the assessment."),
  feedback: z.string().describe("The feedback or learning outcome associated with the assessment. What should the student demonstrate?"),
});


const AnalyzeContentOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the document\'s key topics and structure.'),
  keyConcepts: z
    .array(z.string())
    .describe('A list of the most important terms and concepts found in the document.'),
  subjectArea: z
    .string()
    .describe('The subject area or field of study identified from the document.'),
  
  coherenceAnalysis: z.string().describe("Critical analysis on the coherence between learning outcomes, planning, and evaluation methods found in the document."),
  strengths: z.array(z.string()).describe("A list of strengths found in the provided document's pedagogical structure or content."),
  recommendations: z.array(z.string()).describe("A list of actionable recommendations to improve the document."),

  courseStructure: z.array(UnitSchema).describe("A list of the course units or modules, each with its own title and learning objectives.").optional(),
  assessments: z.array(AssessmentSchema).describe("A list of the course assessments, including type, description, and feedback/learning outcome.").optional(),
  
  bibliography: z.object({
      mentioned: z.array(z.string()).describe('A list of bibliographic references or source materials mentioned directly in the document.').optional(),
      recommended: z.array(z.string()).describe('A list of relevant, modern external bibliographic recommendations (books, key articles) that are NOT in the original document but are highly relevant to the subject area. Prioritize resources from the last 5 years from reliable sources like .edu, .gov, or academic journals. They must be formatted in APA 7th Edition style.'),
  }).optional(),

  linksOfInterest: z.array(z.object({ title: z.string(), url: z.string().url() })).describe("A list of relevant links of interest (articles, blogs, resources) about the subject area."),
  reviewVideos: z.array(z.object({ title: z.string(), url: z.string().url() })).describe("A list of relevant YouTube videos for reviewing the key concepts."),
  activeMethodologies: z.array(z.object({ name: z.string(), description: z.string() })).describe("Examples of active teaching methodologies or ICTs applicable to the subject."),

});

export async function analyzeAndEnrichContent(
  input: z.infer<typeof AnalyzeContentInputSchema>
): Promise<z.infer<typeof AnalyzeContentOutputSchema>> {
  const analysisPrompt = ai.definePrompt({
      name: 'contentAnalysisPrompt',
      input: { schema: AnalyzeContentInputSchema },
      output: { schema: AnalyzeContentOutputSchema },
      prompt: `You are an expert university pedagogy assistant. Your task is to perform a deep, critical, and structured analysis of the provided educational document (syllabus, exam, course plan, etc.). Your analysis must be coherent, constructive, and based on pedagogical principles like Bloom's Taxonomy.

      IMPORTANT: All generated text, summaries, titles, and descriptions MUST be in Spanish. All generated URLs must be valid, well-formed (starting with https://), and directly related to the content. Do not include spaces within URLs.

      Document: {{media url=documentDataUri}}

      Follow these steps for your analysis:

      1.  **Basic Information Extraction:**
          *   **Subject Area:** Identify the specific field of study (e.g., Kinesiology, Nutrition, Philosophy).
          *   **Summary:** Provide a concise summary of the document's main topics and purpose.
          *   **Key Concepts:** List the most critical keywords and concepts.
          *   **Course Structure & Assessments:** Identify units, learning objectives, and assessments as defined in the schema. For each unit, you MUST break it down into a list of individual, specific class topics. For example, a unit on "Cell Biology" might have classes on "The Cell Membrane", "Mitochondria and Energy", and "Protein Synthesis". If no structure is found, return an empty array for 'courseStructure'. If no assessments are found, return an empty array for 'assessments'.

      2.  **Critical Pedagogical Analysis:**
          *   **Coherence Analysis:** Critically evaluate the alignment between the stated **Learning Outcomes** (or general learning goals) and the **Evaluation Methods** (exams, projects). Does the exam truly measure the analytical and application skills mentioned in the plan, or does it only measure memorization? Identify any misalignments.
          *   **Strengths:** Identify the strong points of the document. (e.g., "Variedad de formatos de preguntas", "Cobertura temática amplia", "Lenguaje claro").
          *   **Actionable Recommendations:** Provide concrete recommendations for improvement based on your analysis. Use a pedagogical framework. (e.g., "Incorporar casos clínicos contextualizados para evaluar análisis y aplicación", "Aumentar el peso de preguntas de desarrollo usando la taxonomía de Bloom para pasar de 'recordar' a 'aplicar' o 'analizar'", "Diseñar una rúbrica explícita para respuestas cortas").

      3.  **Content Enrichment (Instead of Weaknesses):**
          *   **Links of Interest:** Provide a list of 3-4 high-quality links to articles, academic blogs, or institutional pages relevant to the core subject. Provide a clear title for each link. Ensure each URL is a valid, working link.
          *   **Review Videos:** Find 2-3 relevant, high-quality educational videos on YouTube that explain key concepts from the document. Provide the direct URL and a descriptive title for each. Ensure each URL is a valid, working link.
          *   **Active Methodologies:** Suggest 2-3 active learning methodologies or ICTs (Information and Communication Technologies) that a teacher could use to teach this subject. For each, provide a name (e.g., "Aprendizaje Basado en Proyectos (ABP)", "Gamificación con Kahoot") and a brief, practical description of how it could be applied.

      4.  **Bibliography Analysis:**
          *   List any bibliography mentioned in the document.
          *   Provide a minimum of 5 **highly relevant, modern recommended bibliographic sources** not mentioned in the document. Prioritize academic sources from the last 5 years (e.g., Scielo, PubMed, Scopus, university books). Each reference MUST be formatted in **APA 7th Edition style**. If no bibliography is mentioned or can be recommended, return an empty object for 'bibliography'.

      Provide a structured JSON response according to the defined output schema. Ensure all fields are populated accurately and in Spanish.`
  });
  
  const { output } = await analysisPrompt(input);
  return output!;
}


// Schema for generating a specific material from analysis
const GenerateMaterialInputSchema = z.object({
    analysisResult: z.object({
        summary: z.string(),
        keyConcepts: z.array(z.string()),
        subjectArea: z.string(),
        coherenceAnalysis: z.string(),
        strengths: z.array(z.string()),
        recommendations: z.array(z.string()),
        courseStructure: z.array(UnitSchema).optional(),
        assessments: z.array(AssessmentSchema).optional(),
        bibliography: z.any().optional(),
        // Weaknesses are removed, so no need to pass them.
    }),
    materialType: z.enum(['powerpointPresentation', 'workGuide', 'exampleTests', 'interactiveReviewPdf']),
    // Add context for single-class generation
    classContext: z.object({
        unitTitle: z.string(),
        classTopic: z.string(),
    }).optional(),
});

const GenerateMaterialOutputSchema = z.object({
  markdownContent: z.string().describe("The full content for the requested educational material, formatted in Markdown and written entirely in Spanish."),
});

const GoodPracticesForExams = `
# Sugerencias de Buenas Prácticas para Crear un Examen Universitario

Aquí tienes un conjunto de **sugerencias de buenas prácticas** para crear un examen universitario, pensado desde la pedagogía universitaria y la evaluación para el aprendizaje:

---

## 1. Claridad en los objetivos
* Define primero los **resultados de aprendizaje** que quieres evaluar.
* Asegúrate de que cada ítem del examen se relacione directamente con esos resultados.
* Explica en las instrucciones qué competencias o conocimientos serán evaluados.

---

## 2. Diversidad de tipos de ítems
* Combina diferentes formatos de preguntas:
  * **Objetivas**: opción múltiple, verdadero/falso, emparejamiento.
  * **De desarrollo**: ensayo corto, resolución de casos, análisis crítico.
  * **Prácticas**: ejercicios de aplicación, interpretación de gráficos, problemas.
* Evita depender solo de preguntas de memoria; incluye ítems que evalúen **comprensión, aplicación y análisis** (Taxonomía de Bloom).

---

## 3. Nivel de dificultad progresivo
* Ordena las preguntas desde lo más sencillo a lo más complejo.
* Incluye preguntas de **nivel básico (recuerdo), intermedio (análisis/aplicación)** y **avanzado (síntesis/reflexión crítica)**.
* Esto permite diferenciar mejor los distintos niveles de logro de los estudiantes.

---

## 4. Redacción precisa y accesible
* Formula enunciados **claros, sin ambigüedades ni tecnicismos innecesarios**.
* Evita frases negativas dobles (ej: “no es incorrecto que…”).
* Revisa ortografía, coherencia y extensión adecuada de cada ítem.

---

## 5. Coherencia y equidad
* Asegúrate de que todos los estudiantes tengan la misma información y el mismo tiempo para responder.
* Considera **ajustes razonables** para estudiantes con necesidades específicas.
* Revisa que el examen no favorezca a quienes dominan solo la memorización.

---

## 6. Instrucciones claras y visibles
* Señala el **tiempo total disponible** y la ponderación de cada sección.
* Explica el formato de respuesta esperado (ejemplo: “responda en máximo 5 líneas”).
* Si es digital, especifica el tipo de archivo o formato de entrega.

---

## 7. Validación y pilotaje
* Revisa el examen con un colega para detectar sesgos o errores.
* Si es posible, **pilota algunas preguntas** con un grupo reducido para ajustar tiempo y dificultad.
* Asegúrate de que los puntajes asignados correspondan al esfuerzo cognitivo requerido.

---

## 8. Retroalimentación posterior
* Informa a los estudiantes no solo la nota, sino también **qué aprendieron y en qué deben mejorar**.
* Entregar una rúbrica o criterios de corrección ayuda a transparentar la evaluación.

---
`;

const PedagogicalFoundationPrompt = `
---

## Fundamentación Pedagógica y Bibliográfica de este Material

Como experto en diseño curricular y pedagogía universitaria, este material ha sido diseñado no solo como un recurso práctico, sino como una manifestación de principios de evaluación para el aprendizaje de alta calidad, garantizando su rigor y pertinencia internacional.

**1. ¿Cómo se construyó este material?**

Este recurso se desarrolló aplicando directamente las recomendaciones del análisis pedagógico previo y las "Sugerencias de Buenas Prácticas" incluidas. Se ha enfocado en:
*   **Conexión Directa con el Análisis:** El diseño de este material responde a las debilidades y fortalezas detectadas en el documento original. Por ejemplo, si se recomendó "incorporar casos clínicos", este material los incluye para pasar de la memorización a la aplicación práctica.
*   **Jerarquía Cognitiva (Taxonomía de Bloom):** Se han formulado actividades y preguntas que buscan elevar el nivel cognitivo, transitando desde el simple "recordar" hacia "analizar", "aplicar" o "evaluar", en línea con las demandas de la formación universitaria actual.
*   **Enfoque en Competencias:** El diseño prioriza la evaluación de competencias y habilidades prácticas sobre la mera repetición de contenido.

**2. Referencias Bibliográficas y Autores Clave de Respaldo:**

La estructura y enfoque de este material se fundamentan en los trabajos de autores y marcos teóricos de referencia en la pedagogía moderna:

*   **Alineamiento Constructivo (Biggs & Tang, 2011):** Este principio sostiene que los objetivos de aprendizaje, las actividades de enseñanza y las tareas de evaluación deben estar perfectamente alineados. El material busca asegurar esta coherencia, garantizando que lo que se evalúa es realmente lo que se pretende enseñar y lo que el estudiante debe aprender.
*   **Diseño Inverso o "Understanding by Design" (Wiggins & McTighe, 2005):** Este material se ha creado partiendo del resultado de aprendizaje esperado. Primero se define qué debe ser capaz de hacer el estudiante, y luego se diseñan las evaluaciones y actividades que le permitirán demostrar esa competencia.
*   **Evaluación para el Aprendizaje (Formative Assessment):** Se considera la evaluación no como un fin en sí mismo, sino como una oportunidad para el aprendizaje. Se incluyen pautas de corrección o respuestas ideales para que tanto el docente como el estudiante tengan claridad sobre los criterios de éxito y las áreas de mejora.

Este enfoque asegura que el material no es un producto genérico, sino una herramienta pedagógica robusta, transparente y diseñada para fomentar un aprendizaje significativo y profundo.
`;


const MaterialPrompts = {
    powerpointPresentation: `
        Generate the content for a PowerPoint presentation based on the provided analysis.
        {{#if classContext}}
        - The presentation should focus exclusively on the topic "{{classContext.classTopic}}" within the unit "{{classContext.unitTitle}}".
        - The first H1 (#) should be the main title of the presentation, which is "{{classContext.classTopic}}".
        - Create 4-6 slides, each with an H2 (##) title.
        - Under each slide title, create 3-5 bullet points (*) with key information, explanations, or examples related to the slide's topic.
        - Ensure the content is detailed, clear, and specifically tailored for this single class session.
        {{else}}
        - The presentation should cover the entire course.
        - The first H1 (#) should be the main title of the presentation.
        - Each subsequent H2 (##) should represent a new slide title, usually corresponding to a course unit.
        - Under each slide title, create 4-6 bullet points (*) summarizing the key information and learning objectives for that topic.
        - Ensure the content is clear, concise, and well-suited for a presentation format.
        {{/if}}
    `,
    workGuide: `
        Generate a comprehensive work guide in markdown format.
        - Use H2 (##) for main sections (like course units) and H3 (###) for subsections.
        - Include sections like "Objetivos de Aprendizaje", "Temas Clave por Unidad", "Actividades Sugeridas", and "Lecturas Adicionales".
        - Use bullet points (*) for detailed information within each section.
    `,
    exampleTests: `
        You will generate a new, improved sample test.
        
        **FIRST**, you MUST include the complete "Good Practices for University Exams" guide at the beginning of the document. This is a static, foundational text.
        
        **SECOND**, after the guide, you will create a new section titled "# Modelo de Examen Mejorado (Basado en Análisis)".
        
        **THIRD**, under this new title, you will generate an improved sample test.
        - **Crucially, use the 'recommendations' from the analysis to build a better exam.** For example, if the analysis recommended using clinical cases, you MUST incorporate clinical cases. If it recommended moving up Bloom's taxonomy, your questions must require application or analysis, not just memorization.
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
    const { analysisResult, materialType, classContext } = input;

    const basePrompt = `You are an expert curriculum developer for the field of ${analysisResult.subjectArea}.
        
    You have been provided with a detailed pedagogical analysis of a course document. Use all the information below to generate the requested material.
    
    IMPORTANT: All generated content MUST be in Spanish. The markdown output must be entirely in Spanish.

    **Subject Area:** ${analysisResult.subjectArea}
    **Course Summary:** ${analysisResult.summary}
    **Key Concepts:** ${analysisResult.keyConcepts?.join(', ')}
    **Coherence Analysis:** ${analysisResult.coherenceAnalysis}
    **Improvement Recommendations:** ${analysisResult.recommendations?.join(', ')}
    
    **Your Specific Task:**
    Based on all the data above, generate content for the following material: **${materialType}**.
    Follow these instructions precisely:
    `;

    // Inject the good practices guide directly into the prompt for exampleTests
    const specificInstructions = materialType === 'exampleTests' 
        ? `${GoodPracticesForExams}\n${MaterialPrompts.exampleTests}`
        : MaterialPrompts[materialType];
    
    // Add the pedagogical foundation to the end of every prompt.
    const finalPrompt = `${basePrompt}\n${specificInstructions}\n\n${PedagogicalFoundationPrompt}\n\nGenerate the content in Markdown and place it in the 'markdownContent' field of the JSON output.`;


    const generationPrompt = ai.definePrompt({
        name: `generate${materialType}Prompt`,
        input: { schema: z.any() },
        output: { schema: GenerateMaterialOutputSchema },
        prompt: finalPrompt,
    });

    const { output } = await generationPrompt(input);
    return output?.markdownContent || '';
}

    