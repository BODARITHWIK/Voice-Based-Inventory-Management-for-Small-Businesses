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
import { useLanguage } from '../context/LanguageContext';
import { INDIAN_LANGUAGES } from '../services/indianLanguages';

const LanguageSelectorModal = ({ open, onClose }) => {
  const { uiLanguage, setUiLanguage, inputLanguage, setInputLanguage, setLanguage } = useLanguage();
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
    // Update UI language & Input language
    setUiLanguage(lang.shortCode || lang.code);
    setLanguage(lang.shortCode || lang.code);
    setInputLanguage(lang.code);
    onClose();
  };

  const isCurrentLanguage = (lang) => {
    if (!lang) return false;
    const current = (uiLanguage || '').toLowerCase();
    return (
      current === lang.shortCode?.toLowerCase() ||
      current === lang.code?.toLowerCase() ||
      current.startsWith(lang.shortCode?.toLowerCase())
    );
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
            <span>🇮🇳</span> Supported Indian Languages
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Speak and manage in your language. 22 official languages of India + English.
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {/* Search Bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search your language... (e.g., Telugu, हिन्दी, Tamil, Kannada)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Region Filter Tabs */}
        <Tabs
          value={regionTab}
          onChange={(e, val) => setRegionTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2.5, minHeight: 36 }}
        >
          <Tab label="All Languages (23+)" value="ALL" sx={{ minHeight: 36, py: 0.5, fontSize: '0.82rem' }} />
          <Tab label="South" value="South" sx={{ minHeight: 36, py: 0.5, fontSize: '0.82rem' }} />
          <Tab label="North / Central" value="North" sx={{ minHeight: 36, py: 0.5, fontSize: '0.82rem' }} />
          <Tab label="East" value="East" sx={{ minHeight: 36, py: 0.5, fontSize: '0.82rem' }} />
          <Tab label="West" value="West" sx={{ minHeight: 36, py: 0.5, fontSize: '0.82rem' }} />
          <Tab label="North-East" value="North-East" sx={{ minHeight: 36, py: 0.5, fontSize: '0.82rem' }} />
        </Tabs>

        {/* Auto Detect Option */}
        <Paper
          elevation={0}
          onClick={() => handleSelect('auto')}
          sx={{
            p: 1.5,
            mb: 2,
            border: inputLanguage === 'auto' ? '2px solid #2563eb' : '1px solid #e2e8f0',
            bgcolor: inputLanguage === 'auto' ? '#eff6ff' : '#f8fafc',
            borderRadius: 2,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AutoAwesomeIcon sx={{ color: '#2563eb' }} />
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                Auto Detect Language
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Speak any Indian language — Swaranidhi automatically identifies what you speak
              </Typography>
            </Box>
          </Box>
          {inputLanguage === 'auto' && <CheckCircleIcon color="primary" fontSize="small" />}
        </Paper>

        {/* Grid of Languages */}
        <Box sx={{ maxHeight: 380, overflowY: 'auto', pr: 0.5 }}>
          <Grid container spacing={1.5}>
            {filteredLanguages.map((lang) => {
              const selected = isCurrentLanguage(lang);
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
                          {lang.name} • {lang.script}
                        </Typography>
                      </Box>
                      {selected && <CheckCircleIcon color="success" fontSize="small" />}
                    </Box>

                    {/* Capability Badges (Section 44 - Transparent) */}
                    <Box sx={{ display: 'flex', gap: 0.6, mt: 1.2, flexWrap: 'wrap' }}>
                      {lang.speechSupported ? (
                        <Chip
                          icon={<MicIcon sx={{ fontSize: '12px !important' }} />}
                          label="Voice"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.68rem' }}
                        />
                      ) : (
                        <Tooltip title="Voice support for this language is coming soon. Text understanding is fully supported.">
                          <Chip
                            icon={<TextSnippetIcon sx={{ fontSize: '12px !important' }} />}
                            label="Text Only"
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.68rem', color: '#64748b' }}
                          />
                        </Tooltip>
                      )}

                      {lang.ttsSupported && (
                        <Chip
                          icon={<VolumeUpIcon sx={{ fontSize: '12px !important' }} />}
                          label="Audio Reply"
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.68rem' }}
                        />
                      )}

                      {lang.status === 'COMING_SOON' && (
                        <Chip
                          label="Coming Soon"
                          size="small"
                          sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#fef3c7', color: '#92400e' }}
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
          Selected: <strong>{uiLanguage.toUpperCase()}</strong> • Understands all 22 Eighth Schedule Indian Languages
        </Typography>
        <Button onClick={onClose} variant="contained" size="small">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LanguageSelectorModal;
