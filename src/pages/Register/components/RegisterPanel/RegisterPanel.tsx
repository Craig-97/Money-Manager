import { AuthPanel, Journey } from '~/components/auth/AuthPanel';

const steps = (created: boolean) => [
  {
    title: 'Create your account',
    description: 'Name, email and a password',
    tag: created ? 'Done' : 'Now'
  },
  {
    title: 'Tell us when you’re paid',
    description: 'Your pay schedule and take-home pay',
    tag: created ? 'Next' : undefined
  },
  { title: 'Add your regular payments', description: 'Rent, bills, subscriptions — tap to add' },
  { title: 'Start your first cycle', description: 'See what’s left before payday' }
];

/* The brand panel beside the register form: what happens after the account is created */
export const RegisterPanel = ({ created }: { created: boolean }) => (
  <AuthPanel
    title="Know what's left before payday."
    lead="Here's what happens after you create your account.">
    <Journey steps={steps(created)} current={created ? 1 : 0} />
  </AuthPanel>
);
