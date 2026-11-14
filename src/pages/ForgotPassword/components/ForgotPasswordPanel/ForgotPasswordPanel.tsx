import { AuthPanel, Journey } from '~/components/auth/AuthPanel';

const STEPS = [
  { title: 'Enter your email', description: 'The one you signed up with' },
  { title: 'Open the link we send', description: 'It works once, for 1 hour' },
  { title: 'Choose a new password', description: "You'll be signed straight back in" }
];

/* The brand panel beside the forgot password form, with where the person is in the reset */
export const ForgotPasswordPanel = ({ sent }: { sent: boolean }) => (
  <AuthPanel
    title="Locked out? It happens."
    lead="You'll be back to your balance in three quick steps.">
    <Journey steps={STEPS} current={sent ? 1 : 0} ticked />
  </AuthPanel>
);
