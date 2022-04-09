import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { MODES } from '../../../constants';
import { ButtonProps } from '../../../types';

export const BackButton = ({ updateMode }: ButtonProps) => (
  <Tooltip title="Back">
    <IconButton onClick={() => updateMode(MODES.OVERVIEW)}>
      <ArrowBackRoundedIcon />
    </IconButton>
  </Tooltip>
);
