import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { MarkTourSeenDocument } from '~/graphql/generated';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { useTourStore } from '~/state/tour';
import { Modal, ModalActions } from '../../ui';
import { showReplayToast } from '../showReplayToast';

/*
 * Offered once, on the dashboard after Setup: a look round, or not. Either answer is saved on the
 * user, so no other device offers it again. Held back while something else needs the screen,
 * e.g. the payday prompt.
 */
export const TourWelcome = ({ held }: { held: boolean }) => {
  const { user } = useCurrentUser();
  const start = useTourStore(s => s.start);
  const [markSeen] = useMutation(MarkTourSeenDocument);
  // Answered here, before the saved answer comes back
  const [answered, setAnswered] = useState(false);

  const answer = (showMe: boolean) => {
    setAnswered(true);
    // If saving fails it's offered again next time, which does no harm
    markSeen().catch(() => undefined);
    if (showMe) start();
    else showReplayToast();
  };

  return (
    <Modal
      open={Boolean(user && !user.tourSeen) && !answered && !held}
      onOpenChange={open => (open ? undefined : answer(false))}
      title="You’re all set up"
      opensItself
      footer={
        <ModalActions
          cancel={{ label: 'I’ll explore on my own', onClick: () => answer(false) }}
          confirm={{ label: 'Show me around', onClick: () => answer(true) }}
        />
      }>
      <p className="text-[15px] leading-[1.55] font-medium text-muted">
        This is your dashboard. Want a quick look round it and the other pages? It takes about two
        minutes.
      </p>
    </Modal>
  );
};
