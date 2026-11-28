/* An aria-describedby from the ids that apply now, or nothing when none do */
export const describedBy = (...ids: (string | false | undefined)[]) =>
  ids.filter(Boolean).join(' ') || undefined;
