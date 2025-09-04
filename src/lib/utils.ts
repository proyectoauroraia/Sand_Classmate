import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import SHA256 from 'crypto-js/sha256';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a SHA-256 hash from a file's data URI.
 * @param dataUri The data URI of the file (e.g., 'data:application/pdf;base64,...').
 * @returns The SHA-256 hash of the file's content.
 */
export function generateFileHash(dataUri: string): string {
    // Extract the Base64 part of the data URI
    const base64String = dataUri.substring(dataUri.indexOf(',') + 1);
    // Hash the Base64 string
    const hash = SHA256(base64String);
    // Return the hash as a hexadecimal string
    return hash.toString();
}
