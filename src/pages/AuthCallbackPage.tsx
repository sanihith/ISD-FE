import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { logout, setToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      logout();
      navigate('/login');
      return;
    }

    // Extract token from URL hash fragment (e.g., #token=xxx)
    const hash = window.location.hash;
    const tokenMatch = hash.match(/[#&]token=([^&]+)/);
    if (tokenMatch && tokenMatch[1]) {
      const token = decodeURIComponent(tokenMatch[1]);
      setToken(token);
      // Clean up URL hash
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }

    // Navigate to dashboard
    navigate('/dashboard');
  }, [searchParams, logout, navigate, setToken]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', px: 3, textAlign: 'center' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2, fontSize: { xs: '0.95rem', sm: '1rem' } }}>Completing sign in...</Typography>
    </Box>
  );
};

export default AuthCallbackPage;