import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { MouseEventHandler, ReactNode } from 'react';
import { formatAmount, isNegative } from '../../../utils';

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
  <div className={`${classBaseName}-total-card`}>
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
              {!!isNegative(amount) && `- `}£{formatAmount(amount)}
            </Typography>
          </div>
          {icon && icon}
        </CardContent>
      </CardActionArea>
    </Card>
  </div>
);
