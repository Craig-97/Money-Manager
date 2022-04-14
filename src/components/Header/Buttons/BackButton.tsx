import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Tooltip title="Back">
      <IconButton onClick={() => navigate('/')}>
        <ArrowBackRoundedIcon />
      </IconButton>
    </Tooltip>
  );
};
