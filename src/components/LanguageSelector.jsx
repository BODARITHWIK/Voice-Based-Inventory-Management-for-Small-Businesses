import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useLanguage } from '../context/LanguageContext';
import { getLanguageByCode } from '../services/indianLanguages';
import LanguageSelectorModal from './LanguageSelectorModal';

const LanguageSelector = ({ variant = 'navbar' }) => {
  const { uiLanguage, inputLanguage } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  const currentLang = getLanguageByCode(uiLanguage);

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        size="small"
        startIcon={<TranslateIcon sx={{ fontSize: 18, color: '#2563eb' }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#64748b' }} />}
        sx={{
          borderRadius: 2.5,
          px: 1.5,
          py: 0.75,
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          color: '#334155',
          fontWeight: 600,
          fontSize: '0.82rem',
          textTransform: 'none',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          '&:hover': {
            backgroundColor: '#eff6ff',
            borderColor: '#93c5fd',
          },
        }}
        aria-label="Choose Indian Language"
      >
        <Box component="span" sx={{ mr: 0.5, fontWeight: 700 }}>
          🇮🇳
        </Box>
        <Typography
          component="span"
          sx={{
            fontWeight: 700,
            fontSize: '0.84rem',
            color: '#1e293b',
          }}
        >
          {inputLanguage === 'auto' ? 'Auto' : currentLang.nativeName}
        </Typography>
      </Button>

      <LanguageSelectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default LanguageSelector;
