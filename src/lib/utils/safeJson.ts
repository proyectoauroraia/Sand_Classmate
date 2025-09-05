
/**
 * Safely parses a JSON string, returning a default value if parsing fails.
 * @param jsonString The JSON string to parse.
 * @param defaultValue The value to return if parsing throws an error. Defaults to an empty object.
 * @returns The parsed object or the default value.
 */
export function safeJson<T = any>(
  jsonString: string | undefined | null,
  defaultValue: T = {} as T
): T {
  if (!jsonString) {
    return defaultValue;
  }
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON string:', error);
    return defaultValue;
  }
}
