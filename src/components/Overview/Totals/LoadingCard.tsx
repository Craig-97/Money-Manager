import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

export const LoadingCard = () => (
  <Card
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: { mobile: '100%', sm: '275px' },
      flexGrow: 1
    }}>
    <CardContent>
      <div className="loading">
        <CircularProgress />
      </div>
    </CardContent>
  </Card>
);
