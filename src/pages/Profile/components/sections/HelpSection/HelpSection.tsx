import { RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '~/components/ui';
import { ROUTES } from '~/constants';
import { useTourStore } from '~/state/tour';
import { SECTION_ICONS } from '../sectionIcons';
import { helpClasses } from '../settingsClasses';
import { SettingsTile } from '../SettingsTile';

/* Getting to know the app: the first-time tour, again */
export const HelpSection = () => {
  const navigate = useNavigate();
  const start = useTourStore(s => s.start);

  const replay = () => {
    // The tour starts on the dashboard
    void navigate(ROUTES.dashboard);
    start();
  };

  return (
    <SettingsTile
      id="help"
      icon={SECTION_ICONS.help}
      title="Help"
      description="Getting to know the app.">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-1">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[13px] font-bold">Tour</span>
          <p className={helpClasses}>
            A quick look round the dashboard and each page, the same one you saw after Setup.
          </p>
        </div>
        <Button
          onClick={replay}
          className="border-border-strong bg-transparent font-bold max-md:h-12 max-md:w-full">
          <RotateCcw size={16} aria-hidden="true" />
          Replay tour
        </Button>
      </div>
    </SettingsTile>
  );
};
