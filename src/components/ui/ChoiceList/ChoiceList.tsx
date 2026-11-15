import { ChevronRight, LucideIcon } from 'lucide-react';

interface Choice<K extends string> {
  key: K;
  Icon: LucideIcon;
  title: string;
  body: string;
}

interface ChoiceListProps<K extends string> {
  choices: readonly Choice<K>[];
  onChoose: (key: K) => void;
  // The question, above the choices on desktop; a phone's sheet title asks it
  prompt?: string;
}

/* "What kind of payment is it?": big buttons, each with an icon, a title and what it's for */
export const ChoiceList = <K extends string>({ choices, onChoose, prompt }: ChoiceListProps<K>) => (
  <div className="flex flex-col gap-3 pb-1">
    {prompt ? (
      <p className="mb-1.5 hidden text-sm font-medium text-muted md:block">{prompt}</p>
    ) : null}
    {choices.map(({ key, Icon, title, body }) => (
      <button
        key={key}
        type="button"
        onClick={() => onChoose(key)}
        className="flex min-h-[92px] w-full cursor-pointer items-center gap-4 rounded-3xl border border-border bg-surface-2 py-[18px] pr-[18px] pl-5 text-left transition-[translate,border-color,background-color] duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:bg-hover max-md:min-h-20 max-md:gap-3.5 max-md:rounded-[22px] max-md:p-4">
        <span className="inline-flex size-[52px] shrink-0 items-center justify-center rounded-[18px] bg-accent-soft text-accent-text max-md:size-12 max-md:rounded-2xl max-md:bg-accent max-md:text-on-accent">
          <Icon size={24} className="max-md:size-[22px]" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-extrabold tracking-[-0.01em]">{title}</span>
          <span className="mt-1 block text-[13px] font-medium text-muted">{body}</span>
        </span>
        <ChevronRight
          size={18}
          strokeWidth={2.25}
          className="shrink-0 text-muted"
          aria-hidden="true"
        />
      </button>
    ))}
  </div>
);
