/** Joins lines into the lightweight markdown used by prompts. Lets content use backticks freely. */
export const md = (...lines: string[]): string => lines.join('\n');
