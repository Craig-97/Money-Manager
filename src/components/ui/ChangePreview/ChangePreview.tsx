interface ChangePreviewProps {
  // What changes: "Free to spend", "Cleared"
  label: string;
  before: string;
  after: string;
}

/* "Free to spend £7,907.50 → £8,152.50": what a change does, shown before it's saved */
export const ChangePreview = ({ label, before, after }: ChangePreviewProps) => (
  <p
    role="status"
    className="flex items-center justify-between gap-2.5 rounded-[18px] bg-accent-soft px-4 py-3 text-[13px] leading-[1.4] font-bold text-accent-text">
    <span>{label}</span>
    <span className="num">
      <s className="font-semibold opacity-70">{before}</s> → {after}
    </span>
  </p>
);
