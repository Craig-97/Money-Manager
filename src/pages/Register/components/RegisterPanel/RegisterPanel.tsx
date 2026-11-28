import { AuthPanel, Journey } from '~/components/auth';

const steps = (created: boolean) => [
  {
    title: 'Create your account',
    description: 'Name, email and a password',
    tag: created ? 'Done' : 'Now'
  },
  // Then Setup's steps
  { title: 'Pay', description: 'When you get paid', tag: created ? 'Next' : undefined },
  { title: 'Your accounts', description: 'Where you keep your money' },
  { title: 'Regular payments', description: 'Rent, bills, subscriptions' },
  { title: 'Coming up', description: 'One-offs due soon', tag: 'Optional' },
  { title: 'Review', description: 'Check and finish' }
];

/* The brand panel beside the register form: what happens after the account is created */
export const RegisterPanel = ({ created }: { created: boolean }) => (
  <AuthPanel
    title="Know what's left before payday."
    lead="Here's what happens after you create your account.">
    <Journey steps={steps(created)} current={created ? 1 : 0} />
  </AuthPanel>
);
