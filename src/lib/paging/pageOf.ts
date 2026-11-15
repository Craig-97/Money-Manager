/* One page of a list: "1–8 of 11", with which way it can move */
export const pageOf = <T>(items: T[], { size, page }: { size: number; page: number }) => {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(page, pages - 1);
  const from = current * size;
  const to = Math.min(items.length, from + size);
  return {
    items: items.slice(from, to),
    page: current,
    paged: pages > 1,
    label: `${from + 1}–${to} of ${items.length}`,
    hasPrev: current > 0,
    hasNext: current < pages - 1
  };
};

export type Paging = ReturnType<typeof pageOf<unknown>>;
