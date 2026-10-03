import { BrandMark } from '~/components/ui/BrandMark';
import { Button } from '~/components/ui/Button';
import { useLogout } from '~/hooks/useLogout';

// TODO(phase 5): the first-time setup flow. Setup has its own layout without the app shell.
export const Setup = () => {
  const logout = useLogout();

  return (
    <main className="flex min-h-dvh flex-col gap-6 px-4 py-5 md:px-12 md:py-10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-[15px] font-bold">Money Manager</span>
        </div>
        <Button variant="ghost" onClick={logout}>
          Sign out
        </Button>
      </div>
      <div className="mx-auto flex w-full max-w-[660px] flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-[-0.04em]">First-time setup</h1>
        <p className="text-sm text-muted">The setup flow is built in phase 5.</p>
      </div>
    </main>
  );
};
