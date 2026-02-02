/**
 * Calculates estimated reading time based on character count.
 * Uses ~400 characters per minute for Japanese text.
 */
export function calculateReadingTime(text: string | null | undefined): number {
    if (!text) return 1;

    // Japanese text: approximately 400-600 characters per minute
    const CHARS_PER_MINUTE = 500;
    const charCount = text.length;
    const minutes = Math.ceil(charCount / CHARS_PER_MINUTE);

    return Math.max(1, minutes);
}

/**
 * Formats reading time as a human-readable string.
 */
export function formatReadingTime(minutes: number): string {
    return `${minutes}分で読めます`;
}
