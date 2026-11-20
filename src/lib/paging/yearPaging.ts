/*
 * A history's years, newest first, as the Pager steps through them: previous goes back a year and
 * next comes forward. `yearOf` turns the page the Pager asks for back into its year.
 */
export const yearPaging = (years: readonly number[], year: number) => {
  const oldestFirst = years.toReversed();
  const page = Math.max(0, oldestFirst.indexOf(year));
  return {
    label: String(year),
    page,
    hasPrev: page > 0,
    hasNext: page < oldestFirst.length - 1,
    yearOf: (to: number) => oldestFirst[to] ?? year
  };
};
