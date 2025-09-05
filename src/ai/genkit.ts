'use server';
/**
 * @fileOverview Genkit configuration and initialization.
 */
import { genkit } from '@genkit-ai/core';
import { groq } from '@genkit-ai/groq';

export const ai = genkit({
  plugins: [
    groq({
      apiKey: process.env.GROQ_API_KEY!,
    }),
  ],
});
