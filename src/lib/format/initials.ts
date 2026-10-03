/* "Test Account" -> "TA" */
export const getInitials = (...names: (string | null | undefined)[]) =>
  names
    .map(name => name?.trim().charAt(0) ?? '')
    .join('')
    .toUpperCase();
