import UpdateIcon from '@mui/icons-material/Update';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import { PAGES } from '../../../constants';

export const ForecastButton = () => {
  const navigate = useNavigate();

  return (
    <Tooltip title={PAGES.FORECAST}>
      <IconButton onClick={() => navigate('/forecast')}>
        <UpdateIcon />
      </IconButton>
    </Tooltip>
  );
};
