import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { MouseEventHandler, ReactNode } from 'react';
import { isNegative, positiveNumber } from '~/utils';

interface TotalCardProps {
  classBaseName?: string;
  title?: string;
  amount?: number;
  icon?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export const TotalCard = ({
  classBaseName,
  title,
  amount,
  icon,
  onClick,
  disabled
}: TotalCardProps) => (
  <Box
    className={`${classBaseName}-total-card`}
    sx={{ width: { mobile: '100%', sm: '275px' }, flexGrow: 1 }}>
    <Card>
      <CardActionArea onClick={onClick} disabled={disabled}>
        <CardContent>
          <div className="total-card__text">
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography
              className={`${isNegative(amount) ? 'negative' : 'positive'}`}
              variant="h4"
              component="h4">
              {!!isNegative(amount) && `- `}£{positiveNumber(amount)}
            </Typography>
          </div>
          {icon && icon}
        </CardContent>
      </CardActionArea>
    </Card>
  </Box>
);
