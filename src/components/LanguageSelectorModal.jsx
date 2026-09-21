import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Box,
  Typography,
  Chip,
  Grid,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MicIcon from '@mui/icons-material/Mic';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useLanguage } from '../context/LanguageContext';
import { INDIAN_LANGUAGES } from '../config/languages';

const LanguageSelectorModal = ({ open, onClose }) => {
  const {
    selectedLanguage,
    selectedLocale,
    setSelectedLanguageAndLocale,
    setInputLanguage,
    backendCapabilities,
    t,
  } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [regionTab, setRegionTab] = useState('ALL');

  const filteredLanguages = useMemo(() => {
    return INDIAN_LANGUAGES.filter((lang) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q) ||
        lang.locale.toLowerCase().includes(q) ||
        lang.region.toLowerCase().includes(q);

      const matchesRegion =
        regionTab === 'ALL' ||
        lang.region.toLowerCase().includes(regionTab.toLowerCase());

      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, regionTab]);

  const handleSelect = (lang) => {
    if (lang === 'auto') {
      setInputLanguage('auto');
      onClose();
      return;
    }
    setSelectedLanguageAndLocale(lang.code, lang.locale);
    onClose();
  };

  const isCurrentLanguage = (lang) => {
    if (!lang) return false;
    const currentCode = (selectedLanguage || '').toLowerCase();
    const currentLocale = (selectedLocale || '').toLowerCase();
    return (
      currentCode === lang.code.toLowerCase() ||
      currentLocale === lang.locale.toLowerCase()
    );
  };

  const getVoiceCapability = (lang) => {
    if (lang.browserSpeechSupported) {
      return { supported: true, label: '✓ Voice', color: 'success' };
    }
    // Check if backend cloud speech supports this locale
    const backendCap = Array.isArray(backendCapabilities) &&
      backendCapabilities.find((b) => b.code === lang.code || b.locale === lang.locale);
    if (backendCap && backendCap.speechRecognitionSupported) {
      return { supported: true, label: '✓ Voice (Cloud)', color: 'info' };
    }
    return {
      supported: false,
      label: '⚠ Voice Unavailable',
      color: 'warning',
      tooltip: `Browser lacks offline ASR for ${lang.name}. Configure a Cloud Speech Provider (Whisper or Bhashini) to enable microphone.`,
    };
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>🇮🇳</span> {t('languageModal.title') || 'Indian Languages & Microphone Setup'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('languageModal.subtitle') || 'Speak and manage in your language. 22 official languages of India + English with exact BCP-47 locales.'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Search & Filter bar */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, mt: 0.5, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('languageModal.searchPlaceholder') || 'Search language by name, script, or state...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#f8fafc',
              },
            }}
          />

          {/* Quick Auto-Detect Button */}
          <Button
            variant="outlined"
            onClick={() => handleSelect('auto')}
            startIcon={<AutoAwesomeIcon sx={{ color: '#2563eb' }} />}
            sx={{
              whiteSpace: 'nowrap',
              borderRadius: 2,
              px: 2,
              borderColor: '#e2e8f0',
              color: '#334155',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#2563eb',
                backgroundColor: '#eff6ff',
              },
            }}
          >
            Auto Detect
          </Button>
        </Box>

        {/* Region Tabs */}
        <Tabs
          value={regionTab}
          onChange={(_, val) => setRegionTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2,
            borderBottom: '1px solid #e2e8f0',
            minHeight: 38,
            '& .MuiTab-root': {
              minHeight: 38,
              py: 0.5,
              fontSize: '0.82rem',
              fontWeight: 600,
              textTransform: 'none',
            },
          }}
        >
          <Tab label="All (23)" value="ALL" />
          <Tab label="South" value="South" />
          <Tab label="North / Central" value="North" />
          <Tab label="West" value="West" />
          <Tab label="East" value="East" />
          <Tab label="North-East" value="North-East" />
        </Tabs>

        {/* Grid of Languages */}
        <Box sx={{ maxHeight: 380, overflowY: 'auto', pr: 0.5 }}>
          <Grid container spacing={1.5}>
            {filteredLanguages.map((lang) => {
              const selected = isCurrentLanguage(lang);
              const voiceCap = getVoiceCapability(lang);
              return (
                <Grid item xs={12} sm={6} md={4} key={lang.code}>
                  <Paper
                    elevation={0}
                    onClick={() => handleSelect(lang)}
                    sx={{
                      p: 1.5,
                      border: selected ? '2px solid #16a34a' : '1px solid #e2e8f0',
                      bgcolor: selected ? '#f0fdf4' : '#ffffff',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease-in-out',
                      '&:hover': {
                        borderColor: selected ? '#16a34a' : '#94a3b8',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: '1.05rem', lineHeight: 1.2 }}>
                          {lang.nativeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                          {lang.name} • {lang.script} ({lang.locale})
                        </Typography>
                      </Box>
                      {selected && <CheckCircleIcon color="success" fontSize="small" />}
                    </Box>

                    {/* Capability Badges (Step 13 - Accurate Capabilities) */}
                    <Box sx={{ display: 'flex', gap: 0.6, mt: 1.2, flexWrap: 'wrap' }}>
                      {/* Text Support */}
                      <Chip
                        icon={<TextSnippetIcon sx={{ fontSize: '12px !important' }} />}
                        label="✓ Text"
                        size="small"
                        color="default"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.68rem' }}
                      />

                      {/* Voice Support */}
                      {voiceCap.supported ? (
                        <Chip
                          icon={<MicIcon sx={{ fontSize: '12px !important' }} />}
                          label={voiceCap.label}
                          size="small"
                          color={voiceCap.color}
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.68rem' }}
                        />
                      ) : (
                        <Tooltip title={voiceCap.tooltip || ''}>
                          <Chip
                            icon={<WarningAmberIcon sx={{ fontSize: '12px !important', color: '#d97706' }} />}
                            label={voiceCap.label}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.68rem', color: '#b45309', borderColor: '#fde68a', bgcolor: '#fffbeb' }}
                          />
                        </Tooltip>
                      )}

                      {/* Audio Reply */}
                      {lang.ttsSupported && (
                        <Chip
                          icon={<VolumeUpIcon sx={{ fontSize: '12px !important' }} />}
                          label="✓ Audio"
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.68rem' }}
                        />
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Active: <strong>{selectedLanguage.toUpperCase()} ({selectedLocale})</strong> • Understands all 22 Eighth Schedule Indian Languages
        </Typography>
        <Button onClick={onClose} variant="contained" size="small" sx={{ textTransform: 'none' }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LanguageSelectorModal;
