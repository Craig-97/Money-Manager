import UpdateIcon from '@mui/icons-material/Update';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { MODES } from '../../../constants';
import { ButtonProps } from '../../../interfaces';
import { capitalizeFirstLetter } from '../../../utils';

export const ForecastButton = ({ updateMode }: ButtonProps) => (
  <Tooltip title={capitalizeFirstLetter(MODES.FORECAST)}>
    <IconButton onClick={() => updateMode(MODES.FORECAST)}>
      <UpdateIcon />
    </IconButton>
  </Tooltip>
);
