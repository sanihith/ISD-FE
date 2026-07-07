import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      logout();
      navigate('/login');
      return;
    }

    // No token in URL anymore - cookie is set by backend
    // Just navigate to dashboard, AuthContext will validate via /api/auth/me
    navigate('/dashboard');
  }, [searchParams, logout, navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', px: 3, textAlign: 'center' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2, fontSize: { xs: '0.95rem', sm: '1rem' } }}>Completing sign in...</Typography>
    </Box>
  );
};

export default AuthCallbackPage;