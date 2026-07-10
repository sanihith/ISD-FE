import { useEffect, memo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { logout, setToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      logout();
      navigate('/login', { replace: true });
      return;
    }

    const completeLogin = async () => {
      const hash = window.location.hash;
      const tokenMatch = hash.match(/[#&]token=([^&]+)/);

      if (!tokenMatch?.[1]) {
        navigate('/login', { replace: true });
        return;
      }

      const token = decodeURIComponent(tokenMatch[1]);
      setToken(token);

      try {
        await apiClient.get('/auth/me');
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Failed to validate auth token after callback', err);
        logout();
        navigate('/login', { replace: true });
      }
    };

    void completeLogin();
  }, [searchParams, logout, navigate, setToken]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', px: 3, textAlign: 'center' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2, fontSize: { xs: '0.95rem', sm: '1rem' } }}>Completing sign in...</Typography>
    </Box>
  );
};

export default memo(AuthCallbackPage);