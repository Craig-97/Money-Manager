import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';

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
