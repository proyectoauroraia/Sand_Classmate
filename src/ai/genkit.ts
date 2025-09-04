import {genkit} from 'genkit';
import {groq} from 'groq';

export const ai = genkit({
  plugins: [groq({apiKey: process.env.GROQ_API_KEY})],
  model: 'groq/llama3-70b-8192',
});
