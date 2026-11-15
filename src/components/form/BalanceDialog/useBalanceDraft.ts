import { useState } from 'react';
import { formatMoneyInput, parseMoney } from '~/lib/format';

interface Options {
  // Goes up each time the dialog opens
  opened: number;
  // The balance as it is, which each opening starts from
  balance: number | undefined;
  close: () => void;
}

/* The balance typed into an Update balance dialog, and saving it, closing once it's saved */
export const useBalanceDraft = ({ opened, balance, close }: Options) => {
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  // A new opening starts from its balance (React's "reset state on a prop change" pattern)
  const [currentOpening, setCurrentOpening] = useState(opened);
  if (opened !== currentOpening) {
    setCurrentOpening(opened);
    setDraft(balance === undefined ? '' : formatMoneyInput(balance));
  }

  const save = async (update: () => Promise<boolean>) => {
    setSaving(true);
    const saved = await update();
    setSaving(false);
    if (saved) close();
  };

  return { draft, setDraft, typed: parseMoney(draft), saving, save };
};
