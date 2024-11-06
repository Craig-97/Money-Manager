import { ReactElement } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

interface LoadingIconButtonProps extends Omit<IconButtonProps, 'children'> {
  loading?: boolean;
  icon: ReactElement;
  tooltip: string;
  progressColor?: string;
}

export const LoadingIconButton = ({
  loading = false,
  icon,
  tooltip,
  progressColor,
  ...props
}: LoadingIconButtonProps) => {
  return (
    <Tooltip title={tooltip}>
      <IconButton {...props}>
        {loading ? <CircularProgress size={24} sx={{ color: progressColor ?? 'white' }} /> : icon}
      </IconButton>
    </Tooltip>
  );
};
