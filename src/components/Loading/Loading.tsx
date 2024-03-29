import CircularProgress from '@mui/material/CircularProgress';

export const Loading = () => (
  <div className="app-loading">
    <CircularProgress />
    <div className="app-loading__message">
      <span>L</span>
      <span>O</span>
      <span>A</span>
      <span>D</span>
      <span>I</span>
      <span>N</span>
      <span>G</span>
    </div>
  </div>
);
