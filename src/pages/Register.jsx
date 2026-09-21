import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Stack,
} from '@mui/material';
import {
  Storefront,
  Person,
  Phone,
  Email,
  Lock,
  LocationOn,
  Visibility,
  VisibilityOff,
  Language,
  CurrencyRupee,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { INDIAN_LANGUAGES } from '../config/languages';
import { useLanguage } from '../context/LanguageContext';

export default function Register() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { register, loading, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    pincode: '',
    gstin: '',
    currency: 'INR',
    defaultLanguage: 'en',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.businessName.trim() ||
      !formData.ownerName.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      setError(t('auth.fillRequired'));
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    const res = await register(formData);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #e0f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 3, md: 5 },
        px: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 680,
          width: '100%',
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(16, 185, 129, 0.08), 0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}
      >
        {/* Header Banner */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#fff',
            p: { xs: 2.5, sm: 3.5 },
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.2)',
              mb: 1.5,
            }}
          >
            <Storefront sx={{ fontSize: 28, color: '#fff' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
            SWARANIDHI
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5, fontWeight: 500 }}>
            {t('auth.registerSubtitle')}
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#065f46', mb: 1.5 }}>
              🏪 {t('settings.businessTab')}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={7}>
                <TextField
                  fullWidth
                  size="small"
                  label={t('auth.businessName')}
                  placeholder="e.g. Balaji Kirana & General Store"
                  value={formData.businessName}
                  onChange={handleChange('businessName')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Storefront fontSize="small" sx={{ color: '#059669' }} />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  size="small"
                  label={t('auth.fullName')}
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.ownerName}
                  onChange={handleChange('ownerName')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person fontSize="small" sx={{ color: '#059669' }} />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label={t('auth.phone')}
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone fontSize="small" sx={{ color: '#059669' }} />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  label={t('auth.email')}
                  placeholder="owner@kirana.com"
                  value={formData.email}
                  onChange={handleChange('email')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email fontSize="small" sx={{ color: '#059669' }} />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Shop Address"
                  placeholder="Shop #12, Main Mandi Road"
                  value={formData.address}
                  onChange={handleChange('address')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn fontSize="small" sx={{ color: '#64748b' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="City"
                  value={formData.city}
                  onChange={handleChange('city')}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="State"
                  value={formData.state}
                  onChange={handleChange('state')}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Pincode"
                  placeholder="520002"
                  value={formData.pincode}
                  onChange={handleChange('pincode')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="GSTIN (Optional)"
                  placeholder="37AAAAA0000A1Z5"
                  value={formData.gstin}
                  onChange={handleChange('gstin')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Default Voice Language"
                  value={formData.defaultLanguage}
                  onChange={handleChange('defaultLanguage')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Language fontSize="small" sx={{ color: '#059669' }} />
                      </InputAdornment>
                    ),
                  }}
                >
                  {INDIAN_LANGUAGES.map((l) => (
                    <MenuItem key={l.code} value={l.code}>
                      {l.nativeName} ({l.name})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#065f46', mb: 1.5 }}>
              🔒 {t('settings.securityTab')}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type={showPassword ? 'text' : 'password'}
                  label={t('auth.password')}
                  value={formData.password}
                  onChange={handleChange('password')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock fontSize="small" sx={{ color: '#059669' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type={showPassword ? 'text' : 'password'}
                  label={t('auth.confirmPassword')}
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock fontSize="small" sx={{ color: '#059669' }} />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.4,
                bgcolor: '#059669',
                '&:hover': { bgcolor: '#047857' },
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.registerBtn')}
            </Button>
          </form>

          <Stack direction="row" justifyContent="center" alignItems="center" sx={{ mt: 3 }} spacing={1}>
            <Button
              component={RouterLink}
              to="/login"
              sx={{
                color: '#059669',
                fontWeight: 700,
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {t('auth.haveAccount')}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
