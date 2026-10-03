// TODO(phase 5): temporary content for pages that haven't been built yet
export const PagePlaceholder = ({ page }: { page: string }) => (
  <section className="rounded-3xl border border-border bg-surface p-6 text-sm text-muted">
    The {page} page is built in phase 5.
  </section>
);
