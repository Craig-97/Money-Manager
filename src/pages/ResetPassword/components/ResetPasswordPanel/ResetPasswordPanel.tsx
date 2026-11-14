import { AuthPanel } from '~/components/auth/AuthPanel';
import { ClockIcon, ShieldCheckIcon } from '~/components/icons';

const FACTS = [
  { Icon: ClockIcon, title: 'Links last 1 hour', text: 'And each one only works once.' },
  {
    Icon: ShieldCheckIcon,
    title: 'Requesting a new link',
    text: 'Cancels any older one straight away.'
  }
];

/* The brand panel beside the reset password form */
export const ResetPasswordPanel = () => (
  <AuthPanel
    title="Almost back in."
    lead="Choose a new password and we'll sign you straight in. Your balance, payments and notes are exactly as you left them.">
    <div aria-hidden="true" className="relative grid grid-cols-2 gap-3">
      {FACTS.map(({ Icon, title, text }) => (
        <div
          key={title}
          className="flex flex-col gap-2.5 rounded-[22px] bg-hero-chip px-5 py-[18px]">
          <Icon size={22} />
          <p className="text-[15px] font-extrabold">{title}</p>
          <p className="text-[13px] leading-[1.45] font-medium text-hero-muted">{text}</p>
        </div>
      ))}
    </div>
  </AuthPanel>
);
