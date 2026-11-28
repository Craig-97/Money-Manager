import { ReactNode } from 'react';
import { helpClasses } from '../settingsClasses';

export const SettingRow = ({
  labelId,
  label,
  help,
  children
}: {
  labelId: string;
  label: string;
  help: string;
  children: ReactNode;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border py-[18px] first:border-t-0 first:pt-1 last:pb-0">
    <div className="flex min-w-0 flex-col gap-1">
      <span id={labelId} className="text-[13px] font-bold">
        {label}
      </span>
      <p className={helpClasses}>{help}</p>
    </div>
    {children}
  </div>
);
