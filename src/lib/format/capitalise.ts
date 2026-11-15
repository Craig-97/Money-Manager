/* "in 3 days" -> "In 3 days", for the start of a line */
export const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
