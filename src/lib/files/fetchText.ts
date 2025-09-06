
'use server';

import { createClient } from '@/lib/supabase/server';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { Readable } from 'stream';

/**
 * Fetches a file from Supabase Storage and extracts its text content.
 * Supports PDF and DOCX file types.
 *
 * @param fileKey The path to the file in the Supabase Storage bucket.
 * @param options Configuration options, including a signal for abortion.
 * @returns A promise that resolves to the extracted text content.
 */
export async function fetchTextFromSupabase(
  fileKey: string,
  options?: { signal?: AbortSignal }
): Promise<string> {
    const supabase = createClient();
    const { data: blob, error } = await supabase.storage.from('uploads').download(fileKey);

    if (error) {
        console.error(`Error downloading file from Supabase: ${fileKey}`, error);
        throw new Error(`Could not download file: ${error.message}`);
    }

    if (options?.signal?.aborted) {
        throw new Error('Request aborted');
    }
    
    const buffer = Buffer.from(await blob.arrayBuffer());

    if (fileKey.toLowerCase().endsWith('.pdf')) {
        const data = await pdf(buffer);
        return data.text;
    } else if (fileKey.toLowerCase().endsWith('.docx')) {
        const { value } = await mammoth.extractRawText({ buffer });
        return value;
    } else {
        throw new Error('Unsupported file type. Only PDF and DOCX are accepted.');
    }
}
