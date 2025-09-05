import { genkit, configureGenkit, llama3 } from '@genkit-ai/core';
import { groq } from 'genkitx-groq';
import { defineModel } from '@genkit-ai/ai/model';

configureGenkit({
  plugins: [
    groq({
      apiKey: process.env.GROQ_API_KEY,
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const model = llama3;

export const ai = genkit;
