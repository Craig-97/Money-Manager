/* "1 month", "3 months": a count and its word, which takes an s for any number but one */
export const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
