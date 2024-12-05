import { ReactNode } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

interface ForecastCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  circleColor: 'primary' | 'success' | 'error';
  valueColor?: 'primary' | 'success' | 'error';
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

export const ForecastCard = ({
  title,
  value,
  subtitle,
  icon,
  circleColor,
  valueColor
}: ForecastCardProps) => {
  return (
    <Card>
      <CardContent sx={{ p: 3, position: 'relative', overflow: 'hidden' }}>
        <Box
          sx={{
            ...circleStyles,
            background: theme => `${theme.palette[circleColor].main}14`
          }}>
          {icon}
        </Box>
        <Typography variant="body1" color="text.secondary" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        <Typography
          variant="h4"
          component="div"
          fontWeight={700}
          sx={valueColor ? { color: `${valueColor}.main` } : undefined}>
          {value}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={500}
          fontSize="0.875rem"
          sx={{ opacity: 0.5 }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};
