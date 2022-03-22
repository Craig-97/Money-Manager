import { MouseEventHandler, ReactNode } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardActionArea from '@material-ui/core/CardActionArea';

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
            <Typography variant="h4" component="h4">
              £{amount}
            </Typography>
          </div>
          {icon && icon}
        </CardContent>
      </CardActionArea>
    </Card>
  </div>
);
