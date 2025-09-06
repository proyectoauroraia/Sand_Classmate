import 'server-only';
import { genkit } from '@genkit-ai/core';
import { groq } from 'genkitx-groq';

export const ai = genkit({
  plugins: [
    groq({
      apiKey: process.env.GROQ_API_KEY!,
    }),
  ],
});
