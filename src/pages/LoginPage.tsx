import { 
  Button, 
  Container, 
  Box, 
  Typography, 
  Stack, 
  Divider,
  Fade,
  Paper,
  Alert
} from '@mui/material';
import {
  Microsoft as MicrosoftIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import logo from '../assets/logo.jpeg';

const LoginPage = () => {
  const { login, teamsLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('error');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url("/login-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.2)',
          zIndex: 1
        }
      }}
    >
      <Fade in timeout={1000}>
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2, px: { xs: 2, sm: 3 } }}>
          <Paper
            elevation={24}
            sx={{
              p: { xs: 3, sm: 4, md: 6 },
              borderRadius: 4,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="WorkTrack Logo"
              sx={{ height: 60, mb: 3 }}
            />

            <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--text-h)', fontSize: { xs: '1.8rem', sm: '2.125rem' } }} gutterBottom>
              WorkTrack
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: { xs: 4, sm: 6 }, px: { xs: 1, sm: 0 } }}>
              The modern standard for task management.
            </Typography>

            {oauthError && (
              <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                Sign in failed. Please try again or contact support if the issue persists.
              </Alert>
            )}
            <Stack spacing={2.5}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={teamsLogin}
                startIcon={<MicrosoftIcon />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  backgroundColor: '#5B5FC7',
                  textTransform: 'none',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#4E52B1' }
                }}
              >
                Sign in with Teams
              </Button>

              <Divider sx={{ my: 1, typography: 'caption', color: 'text.secondary' }}>
                POWERED BY MICROSOFT 365
              </Divider>

              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={login}
                startIcon={<MicrosoftIcon />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
              >
                Sign in with Microsoft
              </Button>
            </Stack>


          </Paper>

          <Typography variant="caption" sx={{ mt: 4, display: 'block', color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
            © 2026 WorkTrack Inc. Built for performance.
          </Typography>
        </Container>
      </Fade>
    </Box>
  );
};

export default LoginPage;