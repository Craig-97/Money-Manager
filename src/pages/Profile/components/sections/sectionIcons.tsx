import { ReactNode } from 'react';
import { CalendarDays, KeyRound, Palette, Settings, User, Wallet } from 'lucide-react';
import { SectionId } from '../../profileModel';

export const SECTION_ICONS: Record<SectionId, ReactNode> = {
  personal: <User size={18} aria-hidden="true" />,
  password: <KeyRound size={18} aria-hidden="true" />,
  payday: <CalendarDays size={18} aria-hidden="true" />,
  balances: <Wallet size={18} aria-hidden="true" />,
  appearance: <Palette size={18} aria-hidden="true" />,
  account: <Settings size={18} aria-hidden="true" />
};
