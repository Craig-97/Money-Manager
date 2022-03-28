import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

export const LoadingCard = () => (
  <div className={`loading-total-card`}>
    <Card>
      <CardContent>
        <div className="loading">
          <CircularProgress />
        </div>
      </CardContent>
    </Card>
  </div>
);
