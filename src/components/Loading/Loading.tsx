import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/system';

// Define keyframes for the loading animation
const loadingAnim = keyframes`
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.8);
  }
`;

export const Loading = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      minHeight: '75vh',
      fontSize: '2em',
      fontWeight: 'bold',
      textAlign: 'center'
    }}>
    <CircularProgress
      sx={{
        color: 'white'
      }}
    />
    <Box>
      {['L', 'O', 'A', 'D', 'I', 'N', 'G'].map((letter, index) => (
        <Typography
          component="span"
          key={index}
          sx={{
            fontSize: '1em',
            fontWeight: 700,
            display: 'inline-block',
            margin: '0 -0.05em',
            animation: `${loadingAnim} 0.7s infinite alternate`,
            animationDelay: `${index * 0.1}s`
          }}>
          {letter}
        </Typography>
      ))}
    </Box>
  </Box>
);
