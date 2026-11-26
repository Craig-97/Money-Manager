import { ReactNode } from 'react';
import {
  Bell,
  CalendarClock,
  CalendarDays,
  CircleHelp,
  KeyRound,
  Palette,
  Settings,
  User,
  Wallet
} from 'lucide-react';
import { SectionId } from '../../profileModel';

export const SECTION_ICONS: Record<SectionId, ReactNode> = {
  personal: <User size={18} aria-hidden="true" />,
  password: <KeyRound size={18} aria-hidden="true" />,
  payday: <CalendarDays size={18} aria-hidden="true" />,
  payments: <CalendarClock size={18} aria-hidden="true" />,
  balances: <Wallet size={18} aria-hidden="true" />,
  reminders: <Bell size={18} aria-hidden="true" />,
  appearance: <Palette size={18} aria-hidden="true" />,
  help: <CircleHelp size={18} aria-hidden="true" />,
  account: <Settings size={18} aria-hidden="true" />
};
