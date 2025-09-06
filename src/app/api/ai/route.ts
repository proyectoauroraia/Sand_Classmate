export const runtime = 'nodejs'; // evita Edge si una lib usa APIs de Node

import { ai } from '@/ai/genkit';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await ai.generate({
    prompt,
    model: 'groq/llama3-8b-8192',
  });

  return NextResponse.json({ text: result.text });
}
