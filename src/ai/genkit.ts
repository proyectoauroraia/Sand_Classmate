
'use server';
/**
 * @fileOverview Genkit configuration and custom model definition for Sand Classmate.
 * This file sets up Genkit and a custom model that uses the Groq API via fetch().
 */
import { genkit } from '@genkit-ai/core';
import { defineModel } from '@genkit-ai/ai/model';

// Initialize Genkit and define the main 'ai' object.
// The call to genkit() replaces the deprecated configureGenkit().
export const ai = genkit({
  plugins: [], // No external plugins needed as we use fetch() directly.
  // In Genkit v1.x, logLevel and other options are not set here.
  // They can be configured via environment variables if needed.
});

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Main model definition for Sand Classmate, using fetch() to interact with Groq's API.
export const sandClassmateModel = defineModel({
  name: 'sand-classmate/groq-llama-fetch',
  info: {
    label: 'Sand Classmate Llama 3 (Fetch)',
    supports: {
      multiturn: true,
      systemRole: true,
      media: true, // Llama3 supports text and media, so let's enable it
      tools: false,   // This model does not support tool use.
      output: ['text'],
    },
  },
}, async (request) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("La variable de entorno GROQ_API_KEY no está configurada.");
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  
  // Map the Genkit request message format to the Groq API format.
  const messages = request.messages.map(msg => {
    // Handle both text and media content
    const content = msg.content.map(part => {
      if (part.text) {
        return { type: 'text', text: part.text };
      }
      if (part.media) {
        // Groq API expects a different format for images than Genkit's media part.
        // This is a placeholder for how one might adapt it if Groq supported it directly via this API.
        // For now, we just pass a text representation.
        return { type: 'text', text: `[Media content at ${part.media.url.substring(0, 50)}...]` };
      }
      return null;
    }).filter(Boolean);

    return {
      role: msg.role === 'model' ? 'assistant' : (msg.role as 'user' | 'system'),
      content: msg.content[0]?.text || '', // Fallback to original text-only logic for now
    };
  });

  // Add the system prompt at the beginning of the messages array.
  const systemPrompt = {
      role: 'system',
      content: `Eres Sand Classmate, un asistente educativo inteligente y amigable.

CARACTERÍSTICAS:
- Explicas conceptos de manera clara y adaptada al nivel del estudiante
- Usas ejemplos prácticos y analogías
- Respondes siempre en español
- Eres paciente y motivador
- Haces preguntas para verificar comprensión

ÁREAS DE EXPERTISE:
- Matemáticas (desde básicas hasta cálculo)
- Ciencias (física, química, biología)
- Programación y tecnología
- Historia y literatura
- Idiomas

ESTILO:
- Conversacional pero educativo
- Estructurado con ejemplos
- Positivo y motivador`
  };

  const body = {
      model: 'llama3-8b-8192',
      messages: [systemPrompt, ...messages],
      max_tokens: request.config?.maxOutputTokens || 1500,
      temperature: request.config?.temperature || 0.7,
      top_p: request.config?.topP || 1,
      stream: false,
  };

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error de la API de Groq: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Detalles no disponibles'}`);
    }

    const completion = await response.json();
    const responseText = completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';

    return {
      candidates: [{
        index: 0,
        finishReason: 'stop',
        message: {
          role: 'model',
          content: [{ text: responseText }]
        }
      }]
    };
  } catch (error) {
    console.error('Error al contactar Groq vía fetch:', error);
    throw new Error(`Error al generar respuesta con Sand Classmate: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
});
