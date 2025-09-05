
'use server';
/**
 * @fileOverview Genkit configuration and custom model definition for Sand Classmate.
 * This file sets up a custom model that uses the Groq API via fetch() to avoid
 * external dependencies and configures Genkit to use it.
 */

import * as genkit from '@genkit-ai/core';
import { defineModel } from '@genkit-ai/ai/model';

// Configure Genkit first to ensure all components are initialized correctly.
genkit.configureGenkit({
  plugins: [], // No external plugins needed as we use fetch() directly.
  logLevel: 'debug',
  enableTracingAndMetrics: true,
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
      media: false, // This model does not support media input.
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
  const messages = request.messages.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : (msg.role as 'user' | 'system'),
      content: msg.content[0]?.text || '',
  }));

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

// Provide a consistent 'ai' object for use across the application.
export const ai = {
    defineModel,
    definePrompt: genkit.definePrompt,
    defineFlow: genkit.defineFlow,
    generate: genkit.generate,
};
