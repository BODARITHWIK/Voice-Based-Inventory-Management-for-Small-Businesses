import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Mic,
  Storefront,
  Lock,
  Email,
  FlashOn,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { login, loading, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError(t('auth.fillRequired'));
      return;
    }

    const res = await login(email.trim(), password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || t('toast.errorGeneric'));
    }
  };

  const handleFillDemo = () => {
    setEmail('owner@kirana.com');
    setPassword('password123');
    setError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #e0f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 460,
          width: '100%',
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(16, 185, 129, 0.08), 0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#fff',
            p: 3.5,
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              mb: 1.5,
            }}
          >
            <Mic sx={{ fontSize: 32, color: '#fff' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
            SWARANIDHI
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5, fontWeight: 500 }}>
            "Speak. Manage. Grow."
          </Typography>
          <Chip
            size="small"
            label="Digital Assistant for Small Businesses"
            sx={{
              mt: 1.5,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        <CardContent sx={{ p: 3.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#1e293b' }}>
            {t('auth.loginTitle')} 👋
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            {t('auth.loginSubtitle')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label={t('auth.email')}
                placeholder="owner@kirana.com or 9876543210"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.4,
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : t('auth.loginBtn')}
              </Button>
            </Stack>
          </form>

          {!import.meta.env.PROD && (
            <>
              <Box sx={{ my: 3 }}>
                <Divider>
                  <Typography variant="caption" sx={{ color: '#94a3b8', px: 1, fontWeight: 600 }}>
                    OR TRY DEMO
                  </Typography>
                </Divider>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                onClick={handleFillDemo}
                startIcon={<FlashOn sx={{ color: '#f59e0b' }} />}
                sx={{
                  py: 1,
                  borderRadius: 2.5,
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#10b981',
                    bgcolor: '#f0fdf4',
                  },
                }}
              >
                {t('auth.demoCredentials')}
              </Button>
            </>
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              <RouterLink
                to="/register"
                style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}
              >
                {t('auth.noAccount')}
              </RouterLink>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
