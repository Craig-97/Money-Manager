import { MouseEventHandler, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { isNegative, positiveNumber } from '~/utils';

interface TotalCardProps {
  title?: string;
  amount?: number;
  icon?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  iconColor?: 'primary' | 'secondary' | 'success';
}

const circleStyles = {
  position: 'absolute',
  right: -25,
  top: -15,
  width: '130px',
  height: '130px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const iconStyles = {
  fontSize: '2.8rem',
  ml: -2,
  mt: 1.5,
  opacity: 0.9
};

export const TotalCard = ({
  title,
  amount,
  icon,
  onClick,
  disabled,
  iconColor = 'primary'
}: TotalCardProps) => (
  <Card
    sx={{
      minHeight: '120px',
      maxHeight: '120px'
    }}>
    <CardActionArea onClick={onClick} disabled={disabled}>
      <CardContent
        sx={{
          p: 3,
          height: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}>
        <Box>
          <Typography color="text.secondary" sx={{ fontWeight: 700 }} gutterBottom>
            {title}
          </Typography>
          <Typography
            variant="h4"
            component="h4"
            sx={{
              fontWeight: 700,
              color: isNegative(amount) ? 'error.main' : undefined
            }}>
            {!!isNegative(amount) && `- `}£{positiveNumber(amount)}
          </Typography>
        </Box>
        {icon && (
          <Box
            sx={{
              ...circleStyles,
              background: theme => `${theme.palette[iconColor].main}14`,
              '& .MuiSvgIcon-root': {
                ...iconStyles,
                color: theme => theme.palette[iconColor].main
              }
            }}>
            {icon}
          </Box>
        )}
      </CardContent>
    </CardActionArea>
  </Card>
);
